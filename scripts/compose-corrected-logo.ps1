param(
  [Parameter(Mandatory = $true)]
  [string]$OriginalPath,

  [Parameter(Mandatory = $true)]
  [string]$CorrectedReferencePath,

  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$original = [System.Drawing.Bitmap]::new($OriginalPath)
$correctedReference = [System.Drawing.Bitmap]::new($CorrectedReferencePath)
$output = [System.Drawing.Bitmap]::new(
  $original.Width,
  $original.Height,
  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
)

try {
  $graphics = [System.Drawing.Graphics]::FromImage($output)
  try {
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.DrawImageUnscaled($original, 0, 0)
    $graphics.FillRectangle(
      [System.Drawing.Brushes]::Transparent,
      805,
      445,
      $original.Width - 805,
      185
    )
  }
  finally {
    $graphics.Dispose()
  }

  $scaleX = $correctedReference.Width / $original.Width
  $scaleY = $correctedReference.Height / $original.Height

  for ($y = 445; $y -lt 630; $y++) {
    $sourceY = [Math]::Min(
      $correctedReference.Height - 1,
      [Math]::Max(0, [int][Math]::Round($y * $scaleY))
    )

    for ($x = 805; $x -lt $original.Width; $x++) {
      $sourceX = [Math]::Min(
        $correctedReference.Width - 1,
        [Math]::Max(0, [int][Math]::Round($x * $scaleX))
      )
      $pixel = $correctedReference.GetPixel($sourceX, $sourceY)
      $darkestChannel = [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))

      # The editor returned a light checkerboard instead of an alpha channel.
      # Recover edge alpha by treating the lightest channel as its blend with
      # white, then unmatte the navy/lime/turquoise foreground color.
      $alpha = 1 - ($darkestChannel / 255)
      if ($alpha -gt 0.08) {
        $red = [Math]::Min(
          255,
          [Math]::Max(0, [int][Math]::Round(($pixel.R - (255 * (1 - $alpha))) / $alpha))
        )
        $green = [Math]::Min(
          255,
          [Math]::Max(0, [int][Math]::Round(($pixel.G - (255 * (1 - $alpha))) / $alpha))
        )
        $blue = [Math]::Min(
          255,
          [Math]::Max(0, [int][Math]::Round(($pixel.B - (255 * (1 - $alpha))) / $alpha))
        )
        $output.SetPixel(
          $x,
          $y,
          [System.Drawing.Color]::FromArgb(
            [int][Math]::Round($alpha * 255),
            $red,
            $green,
            $blue
          )
        )
      }
    }
  }

  $outputDirectory = Split-Path -Parent $OutputPath
  if ($outputDirectory) {
    [System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null
  }
  $output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $output.Dispose()
  $correctedReference.Dispose()
  $original.Dispose()
}
