# myIU Backend Starter — downloads Maven if needed and runs Spring Boot
$ErrorActionPreference = "Stop"

$JAVA_HOME_PATH = "C:\Program Files\Java\jdk-26.0.1"   # Java 26 — verified working
$MVN_DIR = "$PSScriptRoot\.mvn-dist"
$MVN_VERSION = "3.9.9"
$MVN_URL = "https://archive.apache.org/dist/maven/maven-3/$MVN_VERSION/binaries/apache-maven-$MVN_VERSION-bin.zip"

# Use bundled Java if needed
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    $env:JAVA_HOME = $JAVA_HOME_PATH
    $env:PATH = "$JAVA_HOME_PATH\bin;$env:PATH"
}

# Download portable Maven if not present
if (-not (Test-Path "$MVN_DIR\apache-maven-$MVN_VERSION\bin\mvn.cmd")) {
    Write-Host "Downloading Maven $MVN_VERSION..." -ForegroundColor Cyan
    $zip = "$env:TEMP\apache-maven-$MVN_VERSION-bin.zip"
    if (-not (Test-Path $zip)) {
        Invoke-WebRequest -Uri $MVN_URL -OutFile $zip -UseBasicParsing
    }
    New-Item -ItemType Directory -Force -Path $MVN_DIR | Out-Null
    Expand-Archive -Path $zip -DestinationPath $MVN_DIR -Force
    Write-Host "Maven downloaded." -ForegroundColor Green
}

$env:PATH = "$MVN_DIR\apache-maven-$MVN_VERSION\bin;$env:PATH"

Write-Host "Starting myIU Spring Boot backend..." -ForegroundColor Green
Write-Host "API available at: http://localhost:8080" -ForegroundColor Yellow
Write-Host "Make sure PostgreSQL is running with database 'myIU_dev'" -ForegroundColor Yellow
Write-Host ""

Set-Location $PSScriptRoot
mvn spring-boot:run
