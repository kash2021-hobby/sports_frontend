import React, { useState, useRef, useEffect } from "react";

const TrialForm = ({ player, clubId, questions = [], onClose, onSuccess }) => {
   // State for scores
   const [scores, setScores] = useState({
      pace: 5,
      passing: 5,
      shooting: 5,
      stamina: 5
   });

   // State for dynamic questions
   const [answers, setAnswers] = useState({});

   // State for medical notes & recommendation
   const [medicalNotes, setMedicalNotes] = useState("");
   const [recommendation, setRecommendation] = useState(false);

   // State and Refs for WebRTC Live Camera
   const [photoFile, setPhotoFile] = useState(null);
   const [photoPreview, setPhotoPreview] = useState(null);
   const [isCameraOpen, setIsCameraOpen] = useState(false);
   const [mediaStream, setMediaStream] = useState(null);
   const videoRef = useRef(null);
   const canvasRef = useRef(null);

   // Loading state
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Clean up the camera stream when the component closes
   useEffect(() => {
      return () => {
         if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
         }
      };
   }, [mediaStream]);

   /* ===============================
      CAMERA FUNCTIONS
   ================================ */
   const startCamera = async () => {
      try {
         // facingMode: "environment" prefers the rear camera on mobile devices
         const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
         });
         setMediaStream(stream);
         setIsCameraOpen(true);
         
         // Attach stream to the video element after a short delay to ensure rendering
         setTimeout(() => {
            if (videoRef.current) {
               videoRef.current.srcObject = stream;
            }
         }, 100);
      } catch (err) {
         console.error("Error accessing camera:", err);
         alert("Could not access camera. Please ensure you have granted browser permissions.");
      }
   };

   const stopCamera = () => {
      if (mediaStream) {
         mediaStream.getTracks().forEach(track => track.stop());
         setMediaStream(null);
      }
      setIsCameraOpen(false);
   };

   const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
         const video = videoRef.current;
         const canvas = canvasRef.current;
         
         // Set canvas dimensions to match the video feed
         canvas.width = video.videoWidth;
         canvas.height = video.videoHeight;
         
         // Draw the current video frame onto the canvas
         const context = canvas.getContext("2d");
         context.drawImage(video, 0, 0, canvas.width, canvas.height);
         
         // Convert the canvas image into a File object for the backend
         canvas.toBlob((blob) => {
            const file = new File([blob], `trial_photo_${player.id}.jpg`, { type: "image/jpeg" });
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
            stopCamera(); // Turn off the camera after snapping
         }, "image/jpeg", 0.9);
      }
   };

   /* ===============================
      FORM HANDLERS
   ================================ */
   const handleScoreChange = (field, value) => {
      setScores(prev => ({ ...prev, [field]: value }));
   };

   // This correctly uses the question string as the key to store the "Yes"/"No" value
   const handleAnswerChange = (questionText, value) => {
      setAnswers(prev => ({ ...prev, [questionText]: value }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (recommendation && !photoFile) {
         alert("A live photo is required to recommend a player to the Admin.");
         return;
      }

      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("player_id", player.id);
      formData.append("pace", scores.pace);
      formData.append("passing", scores.passing);
      formData.append("shooting", scores.shooting);
      formData.append("stamina", scores.stamina);
      formData.append("recommendation", recommendation);
      formData.append("medical_notes", medicalNotes);
      formData.append("checklist_answers", JSON.stringify(answers));

      if (photoFile) {
         formData.append("trial_photo", photoFile);
      }

      try {
         const response = await fetch("http://localhost:5000/trial/evaluate", {
            method: "POST",
            body: formData,
         });

         if (response.ok) {
            alert("Evaluation submitted successfully!");
            onSuccess();
         } else {
            const errorData = await response.json();
            alert("Failed to submit: " + (errorData.error || "Unknown error"));
         }
      } catch (error) {
         console.error("Evaluation error:", error);
         alert("Server error occurred while submitting evaluation.");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="flex flex-col h-full max-h-[90vh] bg-white rounded-3xl overflow-hidden">
         
         {/* HEADER */}
         <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
               <h2 className="text-2xl font-extrabold text-slate-900">Evaluate Player</h2>
               <p className="text-sm font-semibold text-emerald-600 mt-1">{player.full_name} • {player.position}</p>
            </div>
            <button
               onClick={onClose}
               className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 transition-colors text-slate-500"
            >
               ✕
            </button>
         </div>

         {/* SCROLLABLE FORM BODY */}
         <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
            <form id="evaluation-form" onSubmit={handleSubmit} className="space-y-8">

               {/* 1. SKILL RATINGS */}
               <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                     Technical Ratings (1-10)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     {['pace', 'passing', 'shooting', 'stamina'].map((skill) => (
                        <div key={skill} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <label className="block text-sm font-bold text-slate-700 capitalize mb-2">{skill}</label>
                           <input
                              type="number"
                              min="1"
                              max="10"
                              value={scores[skill]}
                              onChange={(e) => handleScoreChange(skill, e.target.value)}
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-center font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                           />
                        </div>
                     ))}
                  </div>
               </section>

              {/* 2. DYNAMIC CHECKLIST */}
               {questions && questions.length > 0 && (
                  <section>
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                        Manager Checklist
                     </h3>
                     <div className="space-y-3">
                        {questions.map((q) => (
                           <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                              <span className="text-sm font-medium text-slate-800 flex-1">
                                 {q.question}
                              </span>
                              <div className="flex gap-2 shrink-0">
                                 <label className="flex items-center gap-1 cursor-pointer">
                                    <input 
                                       type="radio" 
                                       name={`question-${q.id}`} 
                                       value="Yes"
                                       // ✅ THIS IS THE FIX: Pass the exact string (q.question)
                                       onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                       className="text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                                    />
                                    <span className="text-sm font-bold text-emerald-700">Yes</span>
                                 </label>
                                 <label className="flex items-center gap-1 cursor-pointer ml-3">
                                    <input 
                                       type="radio" 
                                       name={`question-${q.id}`} 
                                       value="No"
                                       // ✅ THIS IS THE FIX: Pass the exact string (q.question)
                                       onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                       className="text-rose-500 focus:ring-rose-500 w-4 h-4"
                                    />
                                    <span className="text-sm font-bold text-rose-700">No</span>
                                 </label>
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>
               )}

               {/* 3. MEDICAL NOTES */}
               <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                     Medical & Physical Notes
                  </h3>
                  <textarea
                     className="w-full border border-slate-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                     rows="3"
                     placeholder="E.g., Cleared physical, minor ankle strapping noted..."
                     value={medicalNotes}
                     onChange={(e) => setMedicalNotes(e.target.value)}
                  ></textarea>
               </section>

               {/* 4. IN-APP CAMERA FOR LIVE PHOTO */}
               <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                     Verification Photo
                  </h3>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50 transition-colors">
                     
                     {/* Hidden Canvas to capture the image frame */}
                     <canvas ref={canvasRef} className="hidden"></canvas>

                     {isCameraOpen ? (
                        <div className="flex flex-col items-center w-full">
                           <div className="relative w-full max-w-sm rounded-xl overflow-hidden bg-black shadow-inner">
                              <video 
                                 ref={videoRef} 
                                 autoPlay 
                                 playsInline 
                                 className="w-full h-auto"
                              ></video>
                           </div>
                           <div className="flex gap-4 mt-5">
                              <button 
                                 type="button" 
                                 onClick={stopCamera}
                                 className="bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                              >
                                 Cancel
                              </button>
                              <button 
                                 type="button" 
                                 onClick={capturePhoto}
                                 className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors"
                              >
                                 📸 Snap Photo
                              </button>
                           </div>
                        </div>
                     ) : photoPreview ? (
                        <div className="relative">
                           <img src={photoPreview} alt="Live Trial Capture" className="w-32 h-32 object-cover rounded-xl shadow-md border-4 border-white" />
                           <button 
                              type="button"
                              onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                              className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1.5 shadow-md hover:bg-rose-600 transition-transform active:scale-95"
                           >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                           </button>
                        </div>
                     ) : (
                        <div className="text-center">
                           <svg className="mx-auto h-12 w-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                           <button 
                              type="button"
                              onClick={startCamera}
                              className="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold shadow-md inline-block transition-transform active:scale-95"
                           >
                              Open Camera
                           </button>
                           <p className="text-xs text-slate-500 mt-3 font-medium">Required if recommending player</p>
                        </div>
                     )}
                  </div>
               </section>

               {/* 5. RECOMMENDATION TOGGLE */}
               <section>
                  <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all shadow-sm ${recommendation ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                     <div>
                        <h4 className={`font-bold text-lg ${recommendation ? 'text-emerald-800' : 'text-slate-800'}`}>Recommend Player to Admin</h4>
                        <p className={`text-sm ${recommendation ? 'text-emerald-600' : 'text-slate-500'}`}>Check this box if the player passed the trial.</p>
                     </div>
                     <div className="relative">
                        <input
                           type="checkbox"
                           className="sr-only"
                           checked={recommendation}
                           onChange={(e) => setRecommendation(e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full transition-colors ${recommendation ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${recommendation ? 'transform translate-x-6' : ''}`}></div>
                     </div>
                  </label>
               </section>

            </form>
         </div>

         {/* FOOTER ACTIONS */}
         <div className="px-6 py-4 border-t border-slate-100 bg-white flex gap-3 justify-end rounded-b-3xl">
            <button
               type="button"
               onClick={onClose}
               disabled={isSubmitting}
               className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
               Cancel
            </button>
            <button
               type="submit"
               form="evaluation-form"
               disabled={isSubmitting}
               className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:active:scale-100"
            >
               {isSubmitting ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>
               ) : (
                  "Submit Evaluation"
               )}
            </button>
         </div>

      </div>
   );
};

export default TrialForm;