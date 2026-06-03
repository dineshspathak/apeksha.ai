import Cocoa

let size = NSSize(width: 1024, height: 1024)
let img = NSImage(size: size)
img.lockFocus()

// Purple gradient background
let rect = NSRect(origin: .zero, size: size)
let path = NSBezierPath(roundedRect: rect, xRadius: 180, yRadius: 180)

let color1 = NSColor(red: 0.486, green: 0.361, blue: 0.988, alpha: 1.0)
let color2 = NSColor(red: 0.180, green: 0.080, blue: 0.560, alpha: 1.0)
let gradient = NSGradient(starting: color1, ending: color2)!
gradient.draw(in: path, angle: -45)

// Draw bold "A" letter in center
let font = NSFont.systemFont(ofSize: 520, weight: .bold)
let attrs: [NSAttributedString.Key: Any] = [
    .font: font,
    .foregroundColor: NSColor.white
]
let text = "A" as NSString
let textSize = text.size(withAttributes: attrs)
let textPoint = NSPoint(x: (1024 - textSize.width) / 2, y: (1024 - textSize.height) / 2 + 20)
text.draw(at: textPoint, withAttributes: attrs)

// Small cyan accent dot (represents AI/intelligence)
let dotRect = NSRect(x: 690, y: 730, width: 70, height: 70)
NSColor(red: 0.3, green: 0.95, blue: 0.75, alpha: 0.95).setFill()
NSBezierPath(ovalIn: dotRect).fill()

img.unlockFocus()

// Save as 1024x1024 PNG
let tiffData = img.tiffRepresentation!
let bitmap = NSBitmapImageRep(data: tiffData)!
let pngData = bitmap.representation(using: .png, properties: [:])!
try! pngData.write(to: URL(fileURLWithPath: "/tmp/apeksha_icon_1024.png"))

// Create iconset
let iconsetPath = "/tmp/ApekshaAI.iconset"
let fm = FileManager.default
try? fm.createDirectory(atPath: iconsetPath, withIntermediateDirectories: true)

// Generate all required sizes
let sizes: [(Int, String)] = [
    (16, "icon_16x16.png"),
    (32, "icon_16x16@2x.png"),
    (32, "icon_32x32.png"),
    (64, "icon_32x32@2x.png"),
    (128, "icon_128x128.png"),
    (256, "icon_128x128@2x.png"),
    (256, "icon_256x256.png"),
    (512, "icon_256x256@2x.png"),
    (512, "icon_512x512.png"),
    (1024, "icon_512x512@2x.png"),
]

for (sz, name) in sizes {
    let resized = NSImage(size: NSSize(width: sz, height: sz))
    resized.lockFocus()
    img.draw(in: NSRect(x: 0, y: 0, width: sz, height: sz))
    resized.unlockFocus()
    
    let tiff = resized.tiffRepresentation!
    let bmp = NSBitmapImageRep(data: tiff)!
    let data = bmp.representation(using: .png, properties: [:])!
    try! data.write(to: URL(fileURLWithPath: "\(iconsetPath)/\(name)"))
}

print("Iconset created. Run: iconutil -c icns /tmp/ApekshaAI.iconset")
