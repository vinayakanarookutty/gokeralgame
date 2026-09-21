Add-Type -AssemblyName System.Drawing

$sourcePath = "c:\Users\HP\Desktop\Corestone\gokeral\public\icon.jpg"
$resDir = "c:\Users\HP\Desktop\Corestone\gokeral\android\app\src\main\res"

if (-not (Test-Path $sourcePath)) {
    Write-Error "Source icon not found at $sourcePath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($sourcePath)
$bgColor = [System.Drawing.ColorTranslator]::FromHtml("#04120a")

function Create-Splash($width, $height, $destPath) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear($bgColor)

    # Calculate center logo size (approx 45% of smaller dimension)
    $minDim = [Math]::Min($width, $height)
    $logoSize = [int]($minDim * 0.48)
    $logoX = [int](($width - $logoSize) / 2)
    $logoY = [int](($height - $logoSize) / 2)

    $g.DrawImage($srcImg, $logoX, $logoY, $logoSize, $logoSize)
    $g.Dispose()

    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated splash: $destPath ($width x $height)"
}

$splashConfigs = @(
    @{ folder = "drawable"; w = 480; h = 800 },
    @{ folder = "drawable-port-mdpi"; w = 320; h = 480 },
    @{ folder = "drawable-port-hdpi"; w = 480; h = 800 },
    @{ folder = "drawable-port-xhdpi"; w = 720; h = 1280 },
    @{ folder = "drawable-port-xxhdpi"; w = 960; h = 1600 },
    @{ folder = "drawable-port-xxxhdpi"; w = 1280; h = 1920 },
    @{ folder = "drawable-land-mdpi"; w = 480; h = 320 },
    @{ folder = "drawable-land-hdpi"; w = 800; h = 480 },
    @{ folder = "drawable-land-xhdpi"; w = 1280; h = 720 },
    @{ folder = "drawable-land-xxhdpi"; w = 1600; h = 960 },
    @{ folder = "drawable-land-xxxhdpi"; w = 1920; h = 1280 }
)

foreach ($cfg in $splashConfigs) {
    $dir = Join-Path $resDir $cfg.folder
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $dest = Join-Path $dir "splash.png"
    Create-Splash $cfg.w $cfg.h $dest
}

$srcImg.Dispose()
Write-Host "All Android native splash screens generated successfully!"
