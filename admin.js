const $=id=>document.getElementById(id);
$("makeQr").addEventListener("click",async()=>{
 const raw=$("siteUrl").value.trim();if(!raw){alert("Cole o endereço público do portal.");return;}
 let url;try{url=new URL(raw);if(url.protocol!=="https:")throw Error();}catch(e){alert("Informe um endereço HTTPS válido.");return;}
 try{await QRCode.toCanvas($("qr"),url.href,{width:280,margin:2,color:{dark:"#242424",light:"#ffffff"}});$("qrArea").classList.remove("hidden");$("qrLabel").textContent=url.href;}catch(e){alert("Não foi possível gerar o QR Code.");}
});
$("downloadQr").addEventListener("click",()=>{const a=document.createElement("a");a.download="qr-code-grupo-acolher-cuidar.png";a.href=$("qr").toDataURL("image/png");a.click();});
$("photos").addEventListener("change",()=>{
 const files=[...$("photos").files];const items=files.map(f=>({src:"fotos/"+f.name,alt:"Fotografia do evento"}));
 $("manifest").value=JSON.stringify(items,null,2);$("photoCount").textContent=`${files.length} fotografia(s) selecionada(s).`; $("copyManifest").disabled=!files.length;
});
$("copyManifest").addEventListener("click",async()=>{try{await navigator.clipboard.writeText($("manifest").value);$("copyManifest").textContent="Manifesto copiado!";}catch(e){$("manifest").select();document.execCommand("copy");$("copyManifest").textContent="Manifesto copiado!";}});
