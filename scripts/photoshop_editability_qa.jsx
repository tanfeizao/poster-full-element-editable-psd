#target photoshop
/* Copy this file AND photoshop_rebuild_v2.jsx + photoshop_qa_v2.jsx together.
   Set paths below. A saved manifest is required; OCR output alone is not a manifest. */
(function(){
 var PSD_PATH='/absolute/ascii/path/final_editable.psd';
 var MANIFEST_PATH='/absolute/ascii/path/manifest.json';
 var OUTPUT_PREFIX='/absolute/ascii/path/editability_QA';
 var dir=File($.fileName).parent;
 $.evalFile(File(dir+'/photoshop_rebuild_v2.jsx'));
 $.evalFile(File(dir+'/photoshop_qa_v2.jsx'));
 var f=File(MANIFEST_PATH);f.encoding='UTF8';if(!f.open('r'))throw Error('MANIFEST_MISSING');var raw=f.read();f.close();
 // Only a trusted, locally authored manifest may be evaluated by ExtendScript.
 var manifest=eval('('+raw+')');PosterQAV2.run(PSD_PATH,manifest,OUTPUT_PREFIX);
})();
