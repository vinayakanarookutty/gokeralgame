Add-Type -AssemblyName System.Drawing

$sourcePath = "c:\Users\HP\Desktop\Corestone\gokeral\public\icon.jpg"
$resDir = "c:\Users\HP\Desktop\Corestone\gokeral\android\app\src\main\res"

if (-not (Test-Path $sourcePath)) {
    Write-Error "Source icon not found at $sourcePath"
    exit 1
}

$densities = @(
    @{ name = "mipmap-mdpi"; launcherSize = 48; fgSize = 108 },
    @{ name = "mipmap-hdpi"; launcherSize = 72; fgSize = 162 },
    @{ name = "mipmap-xhdpi"; launcherSize = 96; fgSize = 216 },
    @{ name = "mipmap-xxhdpi"; launcherSize = 144; fgSize = 324 },
    @{ name = "mipmap-xxxhdpi"; launcherSize = 192; fgSize = 432 }
)

$srcImg = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-Image($src, $width, $height, $destPath) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, 0, 0, $width, $height)
    $g.Dispose()
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

foreach ($d in $densities) {
    $targetFolder = Join-Path $resDir $d.name
    if (-not (Test-Path $targetFolder)) {
        New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
    }

    # ic_launcher.png
    $launcherPath = Join-Path $targetFolder "ic_launcher.png"
    Resize-Image $srcImg $d.launcherSize $d.launcherSize $launcherPath

    # ic_launcher_round.png
    $roundPath = Join-Path $targetFolder "ic_launcher_round.png"
    Resize-Image $srcImg $d.launcherSize $d.launcherSize $roundPath

    # ic_launcher_foreground.png
    $fgPath = Join-Path $targetFolder "ic_launcher_foreground.png"
    Resize-Image $srcImg $d.fgSize $d.fgSize $fgPath

    Write-Host "Generated icons for $($d.name): $($d.launcherSize)x$($d.launcherSize) and $($d.fgSize)x$($d.fgSize)"
}

$srcImg.Dispose()
Write-Host "All Android icons generated successfully from custom GoKeralam logo!"
