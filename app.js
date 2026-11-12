const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights";
const $ = id => document.getElementById(id);
const selfieInput=$("selfie"), preview=$("preview"), previewWrap=$("previewWrap"), searchBtn=$("searchBtn");
let selfieFile=null, ready=false;
const cfg=window.EVENT_CONFIG||{name:"Evento",subtitle:"Encontre suas fotos.",privacy:""};
$("eventTag").textContent=cfg.name.toUpperCase();
$("intro").textContent=cfg.subtitle;
$("privacyText").textContent=cfg.privacy;
function status(msg,type=""){const el=$("status");el.textContent=msg;el.className="status "+type;}
async function loadModels(){
 try{
  if(!window.faceapi)throw Error("Biblioteca de reconhecimento indisponível.");
  await Promise.all([faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)]);
  ready=true;status("Tecnologia pronta. Escolha sua selfie para começar.","ok");searchBtn.disabled=!selfieFile;
 }catch(e){status("Não foi possível carregar a tecnologia. Verifique a internet e atualize a página.","error");console.error(e);}
}
selfieInput.addEventListener("change",()=>{
 const f=selfieInput.files?.[0];if(!f)return;
 if(!/^image\/(jpeg|png|webp)$/.test(f.type)){status("Escolha uma imagem JPG, PNG ou WEBP.","error");return;}
 selfieFile=f;preview.src=URL.createObjectURL(f);previewWrap.classList.remove("hidden");searchBtn.disabled=!ready;
 status(ready?"Selfie selecionada. Você já pode iniciar a busca.":"Aguarde o carregamento da tecnologia.");
});
$("clearSelfie").addEventListener("click",()=>{selfieFile=null;selfieInput.value="";preview.src="";previewWrap.classList.add("hidden");searchBtn.disabled=true;});
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});}
async function descriptor(img){const d=await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();return d?.descriptor||null;}
async function runSearch(){
 if(!ready||!selfieFile)return;searchBtn.disabled=true;$("results").classList.add("hidden");$("gallery").innerHTML="";
 try{
  status("Analisando sua selfie…");const self=await loadImage(URL.createObjectURL(selfieFile));const target=await descriptor(self);
  if(!target)throw Error("Não identificamos um rosto. Tente uma selfie frontal, nítida e bem iluminada.");
  const res=await fetch("fotos/manifest.json",{cache:"no-store"});if(!res.ok)throw Error("A galeria deste evento ainda não foi configurada.");
  const photos=await res.json();if(!Array.isArray(photos)||!photos.length)throw Error("Ainda não há fotografias cadastradas.");
  const matches=[];
  for(let i=0;i<photos.length;i++){
   status(`Analisando fotografias ${i+1} de ${photos.length}…`);
   try{
    const img=await loadImage(photos[i].src);const ds=await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    let best=Infinity;for(const d of ds){const dist=faceapi.euclideanDistance(target,d.descriptor);if(dist<best)best=dist;}
    if(best<0.52)matches.push({...photos[i],distance:best});
   }catch(e){console.warn("Foto não analisada:",photos[i].src,e);}
  }
  matches.sort((a,b)=>a.distance-b.distance);$("results").classList.remove("hidden");$("count").textContent=`${matches.length} encontrada(s)`;
  if(!matches.length){$("gallery").innerHTML='<div class="empty">Não encontramos correspondências com segurança. Experimente outra selfie ou peça à organização para consultar a galeria completa.</div>';}
  else for(const p of matches){
   const card=document.createElement("article");card.className="photo";const img=document.createElement("img");img.loading="lazy";img.src=p.src;img.alt=p.alt||"Fotografia do evento";
   const link=document.createElement("a");link.href=p.src;link.target="_blank";link.rel="noopener";link.textContent="Visualizar / baixar ↗";card.append(img,link);$("gallery").append(card);
  }
  status("Busca concluída. Confira os resultados antes de baixar.","ok");
 }catch(e){status(e.message||"Erro ao realizar a busca.","error");}
 finally{searchBtn.disabled=false;}
}
searchBtn.addEventListener("click",runSearch);loadModels();
