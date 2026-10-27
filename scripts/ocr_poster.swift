import Foundation
import AppKit
import Vision
let inputs=CommandLine.arguments.dropFirst()
for path in inputs {
 do {
  let url=URL(fileURLWithPath:path)
  let req=VNRecognizeTextRequest()
  req.recognitionLevel = .accurate
  req.usesLanguageCorrection = false
  req.recognitionLanguages = ["zh-Hans", "en-US"]
  let handler=VNImageRequestHandler(url:url,options:[:])
  try handler.perform([req])
  let rows=(req.results ?? []).compactMap { o -> [String:Any]? in
   guard let c=o.topCandidates(1).first else {return nil}
   let b=o.boundingBox
   return ["text":c.string,"confidence":c.confidence,"bounds_norm":[b.minX,1-b.maxY,b.maxX,1-b.minY]]
  }
  let data=try JSONSerialization.data(withJSONObject:rows,options:[.prettyPrinted,.sortedKeys,.withoutEscapingSlashes])
  try data.write(to:URL(fileURLWithPath:path+".ocr_draft.json"))
  print(url.lastPathComponent+": "+String(rows.count)+" blocks")
 } catch {print("ERROR "+path+": "+error.localizedDescription)}
}
