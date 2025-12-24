import React, { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { Experience } from "./components/Experience";
import { UIOverlay } from "./components/UIOverlay";
import { GestureController } from "./components/GestureController";
import { TreeMode } from "./types";

// Simple Error Boundary to catch 3D resource loading errors (like textures)
interface EBProps { children: React.ReactNode; }
interface EBState { hasError: boolean; }
class ErrorBoundary extends React.Component<EBProps, EBState> {
  state: EBState = { hasError: false };

  constructor(props: EBProps) {
    super(props);
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error loading 3D scene:", error, errorInfo);
  }

  // Explicitly defining setState for the compiler if needed, though Component has it
  public setState: any;
  public props: any;

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 text-[#D4AF37] font-serif p-8 text-center">
          <div>
            <h2 className="text-2xl mb-2">Algo salió mal</h2>
            <p className="opacity-70">
              Un recurso no se pudo cargar. Revisa la consola para más detalles.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [mode, setMode] = useState<TreeMode>(TreeMode.FORMED);
  const [handPosition, setHandPosition] = useState<{
    x: number;
    y: number;
    detected: boolean;
  }>({ x: 0.5, y: 0.5, detected: false });
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    '/photos/principal.png',
    '/photos/segunda.png',
    '/photos/tercera.png',
    '/photos/image.png',
    '/photos/image copy.png',
    '/photos/image copy 2.png',
    '/photos/image copy 3.png',
    '/photos/image copy 4.png',
    '/photos/fea.png',
    '/photos/otramediarara.png',
  ]);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMusicMuted, setIsMusicMuted] = useState(true); // Default to muted for manual activation
  const [musicActivated, setMusicActivated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const instructions = [
    {
      title: "👋 ¡Bienvenida, Gianny!",
      text: "Estás a punto de entrar en un rincón mágico donde la tecnología y tus recuerdos se encuentran.",
      joke: "¿Qué le pasa a Santa cuando se queda atrapado en una chimenea? ¡Que le entra Claustrofobia! 🎅"
    },
    {
      title: "🖐️ Control por Gestos",
      text: "Usa tu mano frente a la cámara. Abre la mano para que los recuerdos orbiten a tu alrededor y cierra el puño para restaurar la armonía.",
      joke: "¿Qué tipo de coches conduce Santa Claus? ¡Un Renol! 🦌"
    },
    {
      title: "🎠 Movimiento Mágico",
      text: "Las imágenes cobrarán vida propia y flotarán en el espacio. Solo tienes que esperar y observar cómo se acercan a ti.",
      joke: "¿Qué reciben los niños malos de los elfos? ¡Nada, porque los elfos no son 'Reyes'! 👑"
    },
    {
      title: "✨ Exploración Profunda",
      text: "Cada elemento interactúa con tu tacto. Haz clic en lo que veas para descubrir detalles que no se perciben a simple vista.",
      joke: "¿Por qué los pájaros no usan Facebook en Navidad? ¡Porque ya tienen Twitter... y mucho frío! 🐦❄️"
    },
    {
      title: "🎁 Secretos en el Brillo",
      text: "Hay rincones escondidos que solo los más curiosos logran ver. ¿Podrás desvelar todos los misterios?",
      joke: "¿Qué le regaló el muñeco de nieve a su novia? ¡Un anillo de 'hielo'! 💍❄️"
    },
    {
      title: "❤️ Vive la Experiencia",
      text: "Esto es una creación única diseñada solo para ti. ¡Disfruta de este ambiente mágico, Gianny!",
      joke: "¿Cómo se saludan los muñecos de nieve? ⛄ - ¡Hola, 'helado'! 🍦"
    }
  ];
  const [isLoadingShare, setIsLoadingShare] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [twoHandsDetected, setTwoHandsDetected] = useState(false);
  const [closestPhoto, setClosestPhoto] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  // Check for share parameter in URL on mount
  useEffect(() => {
    const loadSharedPhotos = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const shareId = urlParams.get("share");

      if (!shareId) return;

      setIsSharedView(true);
      setIsLoadingShare(true);

      try {
        // Try API first (works in vercel dev and production)
        try {
          const response = await fetch(`/api/share?id=${shareId}`);
          const data = await response.json();

          if (response.ok && data.success) {
            setUploadedPhotos(data.images);
            return;
          }
        } catch (apiError) {
          console.log("API not available, trying localStorage fallback");
        }

        // Fallback to localStorage if API fails (pure vite dev mode)
        const shareDataStr = localStorage.getItem(`share_${shareId}`);
        if (shareDataStr) {
          const shareData = JSON.parse(shareDataStr);
          setUploadedPhotos(shareData.images);
        } else {
          console.error("Share not found");
        }
      } catch (error) {
        console.error("Error loading shared photos:", error);
      } finally {
        setIsLoadingShare(false);
      }
    };

    loadSharedPhotos();
  }, []);

  const toggleMode = () => {
    setMode((prev) =>
      prev === TreeMode.FORMED ? TreeMode.CHAOS : TreeMode.FORMED
    );
  };

  const handleHandPosition = (x: number, y: number, detected: boolean) => {
    setHandPosition({ x, y, detected });
  };

  const handleTwoHandsDetected = (detected: boolean) => {
    setTwoHandsDetected(detected);
  };

  const handleClosestPhotoChange = (photoUrl: string | null) => {
    setClosestPhoto(photoUrl);
  };

  const handlePhotosUpload = (photos: string[]) => {
    setUploadedPhotos(photos);
  };

  const funnyCaptions = [
    "¿Qué hace un perro con un taladro? 'Ta-taladrando'. 🐶",
    "¿Por qué el libro de matemáticas se suicidó? Tenía muchos problemas. 📚",
    "Mi novia me dejó... ¡pero me dejó la puerta abierta! 😉",
    "¿Qué es largo, duro y tiene nombre de mujer? La barandilla. 🤭",
    "¿En qué se parece un termómetro a una mujer? En que cuando se calientan se suben los grados. 🔥",
    "¿Qué tiene 4 letras, empieza por C y termina con O? El CODO. ¡Mal pensada! 🦾",
    "¿Qué es peludo por fuera y húmedo por dentro? Un coco. 🥥",
    "¿Qué entra duro y sale blando y mojado? ¡Un chicle! 😂",
    "¿Por qué las mujeres no usan paracaídas? Porque del cielo solo caen ángeles... y este bombón. 😎",
    "¿Qué es negro, blanco y se ríe? Una cebra haciendo cosquillas. 🦓",
    "¡Ríete un poco, Gianny! Que la vida es corta y tu risa es arte. ✨"
  ];

  const specialMessages = [
    "¿Qué hace un perro con un taladro? 'Ta-taladrando'. 🐶",
    "¿Por qué el libro de matemáticas se suicidó? Tenía muchos problemas. 📚",
    "Mi novia me dejó... ¡pero me dejó la puerta abierta! 😉",
    "¿Qué es largo, duro y tiene nombre de mujer? La barandilla. 🤭",
    "¿En qué se parece un termómetro a una mujer? En que cuando se calientan se suben los grados. 🔥",
    "¿Qué tiene 4 letras, empieza por C y termina con O? El CODO. ¡Mal pensada! 🦾",
    "¿Qué es peludo por fuera y húmedo por dentro? Un coco. 🥥",
    "¿Qué entra duro y sale blando y mojado? ¡Un chicle! 😂",
    "¿Por qué las mujeres no usan paracaídas? Porque del cielo solo caen ángeles... y este bombón. 😎",
    "¿Qué es negro, blanco y se ríe? Una cebra haciendo cosquillas. 🦓",
    "¡Ríete un poco, Gianny! Que la vida es corta y tu risa es arte. ✨"
  ];

  const handlePhotoClick = (photoUrl: string) => {
    const index = uploadedPhotos.indexOf(photoUrl);
    setClosestPhoto(photoUrl);
    setSelectedMessage(specialMessages[index % specialMessages.length]);
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-black via-[#001a0d] to-[#0a2f1e]">
      
      {/* Background Music Player (Hidden) */}
      <div className="fixed -top-[1000px] -left-[1000px] opacity-0 pointer-events-none">
        <iframe
          id="global-christmas-music"
          width="1"
          height="1"
          src={`https://www.youtube.com/embed/aAkMkVFwAoo?enablejsapi=1&autoplay=1&loop=1&playlist=aAkMkVFwAoo&controls=0&start=30&mute=${isMusicMuted ? 1 : 0}`}
          title="Christmas Music"
          allow="autoplay"
        ></iframe>
      </div>

      {/* Persistent Music Control Button */}
      <div className="fixed top-8 left-8 pointer-events-auto z-[200]">
        <button
          id="global-music-toggle-btn"
          onClick={() => {
            const newMutedState = !isMusicMuted;
            setIsMusicMuted(newMutedState);
            const iframe = document.getElementById('global-christmas-music') as HTMLIFrameElement;
            if (iframe) {
              // Ensure we force the iframe state update
              iframe.src = iframe.src.replace(`mute=${newMutedState ? '0' : '1'}`, `mute=${newMutedState ? '1' : '0'}`);
            }
          }}
          className="group p-4 border-2 border-[#D4AF37] bg-black/60 backdrop-blur-xl rounded-full transition-all duration-300 hover:scale-110 hover:border-white shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          title={isMusicMuted ? "Activar Música" : "Silenciar Música"}
        >
          {isMusicMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          )}
        </button>
      </div>

      {/* Splash Screen */}
      {!hasStarted && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center bg-black overflow-y-auto pointer-events-auto">
          
          {/* Large BTS Photos Outside the Frame */}
          <div className="fixed bottom-0 left-0 z-10 pointer-events-none w-1/4 max-w-[400px]">
            <img src="/photos/btscargando.png" alt="BTS Large 1" className="w-full h-auto object-contain animate-bounce-slow drop-shadow-[0_0_30px_rgba(212,175,55,0.2)]" />
          </div>
          <div className="fixed bottom-0 right-0 z-10 pointer-events-none w-1/4 max-w-[400px]">
            <img src="/photos/btscargando2.png" alt="BTS Large 2" className="w-full h-auto object-contain animate-pulse-slow drop-shadow-[0_0_30px_rgba(212,175,55,0.2)]" />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-4xl w-full px-6 py-8 md:py-16">
             <div className="flex flex-col items-center gap-2 mb-10 w-full">
                <h1 className="text-3xl md:text-7xl font-bold text-[#D4AF37] font-serif drop-shadow-[0_0_30px_rgba(212,175,55,0.6)] text-center leading-tight uppercase tracking-widest">
                   ¡Feliz Navidad Gianny!
                </h1>
               <div className="w-32 md:w-64 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
             </div>

             {/* Steps Card */}
             <div className="bg-black/90 backdrop-blur-3xl border-2 border-[#D4AF37]/30 p-5 md:p-12 rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.9)] w-full relative transition-all duration-500 min-h-[450px] md:min-h-[500px] flex flex-col justify-between">
                
                {/* Joke Badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black px-4 py-1 md:px-6 md:py-2 rotate-12 font-bold shadow-xl text-xs md:text-base z-20">
                  YA TU SABE! 🤣
                </div>

                <div className="animate-fade-in" key={currentStep}>
                  <h2 className="text-[#D4AF37] font-serif text-2xl md:text-4xl mb-4 md:mb-6 flex items-center gap-4">
                    <span className="bg-[#D4AF37] text-black w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full text-base md:text-xl">{currentStep + 1}</span>
                    {instructions[currentStep].title}
                  </h2>
                  <p className="text-[#F5E6BF] text-base md:text-2xl font-serif leading-relaxed mb-6 md:mb-8 opacity-90">
                    {instructions[currentStep].text}
                  </p>

                  {/* Play Music Button on Step 1 to trigger user interaction */}
                  {currentStep === 0 && (
                    <div className="flex flex-col items-center gap-6 my-8">
                       {!musicActivated ? (
                         <div className="flex justify-center">
                           <button 
                             onClick={() => {
                               setIsMusicMuted(false);
                               setMusicActivated(true);
                               const iframe = document.getElementById('global-christmas-music') as HTMLIFrameElement;
                               if (iframe) {
                                  iframe.src = iframe.src.replace('mute=1', 'mute=0');
                               }
                             }}
                             className="px-8 py-4 md:px-10 md:py-5 bg-gradient-to-br from-red-600 via-red-500 to-red-800 text-white rounded-xl font-bold font-serif shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] hover:scale-105 transition-all duration-500 flex items-center gap-4 group pointer-events-auto text-sm md:text-lg border border-red-400/30"
                           >
                             <span className="text-xl group-hover:rotate-12 transition-transform">🎵</span> 
                             <span className="tracking-widest uppercase">Activar Música Navideña</span>
                           </button>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center animate-fade-in w-full gap-4">
                           <div className="text-xl italic text-[#D4AF37] text-center">¡Música activada con éxito! ✨</div>
                           <button 
                             onClick={() => setCurrentStep(1)}
                             className="px-12 py-3 bg-[#D4AF37] text-black font-bold font-serif hover:bg-white transition-all duration-300 flex items-center gap-3 text-lg tracking-[0.2em] uppercase rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                           >
                             CONTINUAR ➔
                           </button>
                         </div>
                       )}
                    </div>
                  )}

                  <div className="bg-[#D4AF37]/10 p-4 md:p-6 border-l-4 border-[#D4AF37] italic text-[#D4AF37] text-base md:text-xl">
                    "{instructions[currentStep].joke}"
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-[#D4AF37]/10">
                   {/* Progress Bar */}
                   <div className="hidden md:flex flex-grow mr-12 items-center gap-3">
                      <div className="flex-grow h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <div 
                           className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5E6BF] transition-all duration-700 ease-out shadow-[0_0_10px_#D4AF37]"
                           style={{ width: `${((currentStep + 1) / instructions.length) * 100}%` }}
                         ></div>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      {/* Next Button Logic */}
                      {currentStep > 0 && currentStep < instructions.length - 1 && (
                        <button 
                          onClick={() => setCurrentStep(prev => prev + 1)}
                          className="px-8 py-3 bg-[#D4AF37] text-black font-bold font-serif hover:bg-white hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center gap-3 text-base tracking-widest uppercase rounded-sm group relative overflow-hidden"
                        >
                          <span className="relative z-10">SIGUIENTE</span>
                          <span className="relative z-10 group-hover:translate-x-1 transition-transform">➔</span>
                        </button>
                      )}
                      
                      {currentStep === instructions.length - 1 && (
                        <button 
                          onClick={() => {
                            setMode(TreeMode.FORMED); setHasStarted(true);
                          }}
                          className="px-10 py-4 bg-gradient-to-r from-[#D4AF37] via-[#F5E6BF] to-[#D4AF37] text-black font-extrabold font-serif hover:scale-105 hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] transition-all animate-pulse text-lg tracking-[0.2em] rounded-md uppercase"
                        >
                          ¡EMPEZAR LA MAGIA! 🎄✨
                        </button>
                      )}
                   </div>
                </div>
             </div>

             {/* Counter Hint */}
             <div className="text-[#D4AF37]/50 font-serif mt-6 md:mt-8 tracking-[0.3em] uppercase text-xs">
                Paso {currentStep + 1} de {instructions.length}
             </div>
          </div>
        </div>
      )}


      <ErrorBoundary children={
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 4, 20], fov: 45 }}
          gl={{ antialias: false, stencil: false, alpha: false }}
          shadows
        >
          <Suspense fallback={null}>
            <Experience
              mode={mode}
              handPosition={handPosition}
              uploadedPhotos={uploadedPhotos}
              twoHandsDetected={twoHandsDetected}
              onClosestPhotoChange={handleClosestPhotoChange}
              onPhotoClick={handlePhotoClick}
            />
          </Suspense>
        </Canvas>
      } />

      <Loader
        containerStyles={{ background: "#000" }}
        innerStyles={{ width: "300px", height: "10px", background: "#333" }}
        barStyles={{ background: "#D4AF37", height: "10px" }}
        dataStyles={{ color: "#D4AF37", fontFamily: "Cinzel" }}
      />

      <UIOverlay
        mode={mode}
        onToggle={toggleMode}
        onPhotosUpload={handlePhotosUpload}
        hasPhotos={uploadedPhotos.length > 0}
        uploadedPhotos={uploadedPhotos}
        isSharedView={isSharedView}
        hasStarted={hasStarted}
      />

      {/* Loading indicator for shared photos */}
      {isLoadingShare && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="text-[#D4AF37] font-serif text-xl">
            Cargando fotos compartidas...
          </div>
        </div>
      )}

      {/* Gesture Control Module */}
      <GestureController
        currentMode={mode}
        onModeChange={(newMode) => {
          if (hasStarted) {
            setMode(newMode);
          }
        }}
        onHandPosition={handleHandPosition}
        onTwoHandsDetected={handleTwoHandsDetected}
      />

      {/* Photo Overlay - Shows when photo is clicked or two hands detected */}
      {closestPhoto && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-auto animate-fade-in" onClick={() => { setClosestPhoto(null); setSelectedMessage(null); }}>
          {/* Semi-transparent backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>

          {/* Polaroid frame with photo */}
          <div className="relative z-50 transform transition-all duration-500 ease-out animate-scale-in flex flex-col items-center gap-8">


            {/* Polaroid container */}
            <div className="bg-white p-6 pb-12 shadow-[0_0_50px_rgba(212,175,55,0.3)] border-8 border-[#D4AF37]/20" style={{ width: '70vmin', maxWidth: '550px' }}>
              {/* Gold clip at top */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-10 bg-gradient-to-b from-[#D4AF37] to-[#C5A028] rounded-sm shadow-xl flex items-center justify-center">
                <div className="w-12 h-1 bg-white/30 rounded-full"></div>
              </div>

              {/* Photo */}
              <div className="relative overflow-hidden group">
                <img
                  src={closestPhoto}
                  alt="Selected Memory"
                  className="w-full aspect-square object-cover shadow-inner"
                />
                <div className="absolute inset-0 border-4 border-[#D4AF37]/10 pointer-events-none"></div>
              </div>

            </div>

            {/* Close Hint */}
            <div className="text-[#D4AF37]/50 font-serif text-sm mt-4 animate-pulse">
              Haz clic en cualquier lugar para cerrar
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
