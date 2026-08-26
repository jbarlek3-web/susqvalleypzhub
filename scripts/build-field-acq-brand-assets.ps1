param(
  [string]$PublicDirectory = (Join-Path $PSScriptRoot "..\public")
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$publicRoot = [System.IO.Path]::GetFullPath($PublicDirectory)
$wordmarkPath = Join-Path $publicRoot "field-acq-ordinance-aide-logo-v2.png"
$iconPath = Join-Path $publicRoot "field-acq-ordinance-aide-icon.png"

function Save-ScaledPng {
  param(
    [Parameter(Mandatory = $true)]
    [System.Drawing.Image]$Source,
    [Parameter(Mandatory = $true)]
    [int]$Size,
    [Parameter(Mandatory = $true)]
    [string[]]$OutputPaths
  )

  $canvas = [System.Drawing.Bitmap]::new(
    $Size,
    $Size,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.DrawImage($Source, 0, 0, $Size, $Size)
    }
    finally {
      $graphics.Dispose()
    }

    foreach ($outputPath in $OutputPaths) {
      $outputDirectory = Split-Path -Parent $outputPath
      [System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null
      $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
  }
  finally {
    $canvas.Dispose()
  }
}

$wordmark = [System.Drawing.Image]::FromFile($wordmarkPath)
$icon = [System.Drawing.Image]::FromFile($iconPath)

try {
  $socialCard = [System.Drawing.Bitmap]::new(1200, 630)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($socialCard)
    try {
      $graphics.Clear([System.Drawing.Color]::FromArgb(247, 249, 252))
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

      $cardWidth = 1100
      $cardHeight = [int][Math]::Round($wordmark.Height * ($cardWidth / $wordmark.Width))
      $graphics.DrawImage(
        $wordmark,
        [int][Math]::Round((1200 - $cardWidth) / 2),
        [int][Math]::Round((630 - $cardHeight) / 2),
        $cardWidth,
        $cardHeight
      )
    }
    finally {
      $graphics.Dispose()
    }

    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
      Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
    try {
      $encoderParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
        [System.Drawing.Imaging.Encoder]::Quality,
        [long]92
      )
      foreach ($outputPath in @(
        (Join-Path $publicRoot "og.jpg"),
        (Join-Path $publicRoot "sbph-logo.jpg")
      )) {
        $socialCard.Save($outputPath, $jpegCodec, $encoderParameters)
      }
    }
    finally {
      $encoderParameters.Dispose()
    }
  }
  finally {
    $socialCard.Dispose()
  }

  Save-ScaledPng -Source $icon -Size 1024 -OutputPaths @(
    (Join-Path $publicRoot "logo.png"),
    (Join-Path $publicRoot "__jb3\logo.png"),
    (Join-Path $publicRoot "__jb3\install\assets\homescreen\ob-phone.png"),
    (Join-Path $publicRoot "__jb3\install\assets\homescreen\ob-ipad.png")
  )
  Save-ScaledPng -Source $icon -Size 256 -OutputPaths @(
    (Join-Path $publicRoot "logo-mark.png")
  )
}
finally {
  $icon.Dispose()
  $wordmark.Dispose()
}
