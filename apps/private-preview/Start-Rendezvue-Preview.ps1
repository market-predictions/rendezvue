$ErrorActionPreference = 'Stop'

$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$address = [System.Net.IPAddress]::Loopback
$port = 4174
$url = "http://127.0.0.1:$port/"

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.mjs' = 'text/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg' = 'image/svg+xml'
  '.png' = 'image/png'
  '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.webp' = 'image/webp'
  '.ico' = 'image/x-icon'
  '.txt' = 'text/plain; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
}

function Write-HttpResponse {
  param(
    [Parameter(Mandatory = $true)] [System.Net.Sockets.NetworkStream] $Stream,
    [Parameter(Mandatory = $true)] [int] $StatusCode,
    [Parameter(Mandatory = $true)] [string] $StatusText,
    [Parameter(Mandatory = $true)] [byte[]] $Body,
    [Parameter(Mandatory = $true)] [string] $ContentType,
    [bool] $SendBody = $true
  )

  $headers = @(
    "HTTP/1.1 $StatusCode $StatusText",
    "Content-Type: $ContentType",
    "Content-Length: $($Body.Length)",
    'Cache-Control: no-store, max-age=0',
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: no-referrer',
    'Connection: close',
    '',
    ''
  ) -join "`r`n"

  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($SendBody -and $Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
  $Stream.Flush()
}

$listener = [System.Net.Sockets.TcpListener]::new($address, $port)

try {
  $listener.Start()
  Write-Host ''
  Write-Host 'Rendezvue private preview is gestart.' -ForegroundColor Green
  Write-Host "Open: $url"
  Write-Host 'Sluit dit venster of druk Ctrl+C om de preview te stoppen.'
  Write-Host ''

  Start-Process $url

  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new(
        $stream,
        [System.Text.Encoding]::ASCII,
        $false,
        4096,
        $true
      )

      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        continue
      }

      do {
        $line = $reader.ReadLine()
      } while ($null -ne $line -and $line.Length -gt 0)

      $parts = $requestLine.Split(' ')
      if ($parts.Length -lt 2) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Bad Request')
        Write-HttpResponse -Stream $stream -StatusCode 400 -StatusText 'Bad Request' -Body $body -ContentType 'text/plain; charset=utf-8'
        continue
      }

      $method = $parts[0].ToUpperInvariant()
      if ($method -ne 'GET' -and $method -ne 'HEAD') {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Method Not Allowed')
        Write-HttpResponse -Stream $stream -StatusCode 405 -StatusText 'Method Not Allowed' -Body $body -ContentType 'text/plain; charset=utf-8' -SendBody ($method -ne 'HEAD')
        continue
      }

      $rawTarget = $parts[1]
      $pathOnly = $rawTarget.Split('?')[0]
      $decodedPath = [System.Uri]::UnescapeDataString($pathOnly).Replace('/', [System.IO.Path]::DirectorySeparatorChar)
      $relativePath = $decodedPath.TrimStart([char[]]@('/', '\'))
      if ([string]::IsNullOrWhiteSpace($relativePath)) {
        $relativePath = 'index.html'
      }

      $candidate = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relativePath))
      $rootPrefix = $root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
      if (-not $candidate.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
        Write-HttpResponse -Stream $stream -StatusCode 403 -StatusText 'Forbidden' -Body $body -ContentType 'text/plain; charset=utf-8' -SendBody ($method -ne 'HEAD')
        continue
      }

      if (-not [System.IO.File]::Exists($candidate)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
        Write-HttpResponse -Stream $stream -StatusCode 404 -StatusText 'Not Found' -Body $body -ContentType 'text/plain; charset=utf-8' -SendBody ($method -ne 'HEAD')
        continue
      }

      $body = [System.IO.File]::ReadAllBytes($candidate)
      $extension = [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()
      $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { 'application/octet-stream' }
      Write-HttpResponse -Stream $stream -StatusCode 200 -StatusText 'OK' -Body $body -ContentType $contentType -SendBody ($method -ne 'HEAD')
    }
    catch {
      Write-Warning $_.Exception.Message
    }
    finally {
      if ($null -ne $client) {
        $client.Close()
      }
    }
  }
}
catch [System.Net.Sockets.SocketException] {
  Write-Host ''
  Write-Host "Poort $port is al in gebruik. Sluit een eerdere preview en probeer opnieuw." -ForegroundColor Red
  Write-Host $_.Exception.Message
  Read-Host 'Druk op Enter om dit venster te sluiten'
  exit 1
}
catch {
  Write-Host ''
  Write-Host 'De private preview kon niet worden gestart.' -ForegroundColor Red
  Write-Host $_.Exception.Message
  Read-Host 'Druk op Enter om dit venster te sluiten'
  exit 1
}
finally {
  $listener.Stop()
}
