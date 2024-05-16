$confirmation = Read-Host "Are you Sure You Want To Proceed(Y/N):"
if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    $packageJsonPath = $PSScriptRoot + "\package.json"
    $packageJsonText = [IO.File]::ReadAllText($packageJsonPath)
    $packageJson = $packageJsonText | ConvertFrom-Json

    # Get main directory.
    $indexHtmlPath = $PSScriptRoot + "\" + $packageJson.main
    $mainDirectory = Split-Path -Path $indexHtmlPath -Parent
    $mainDirectoryMessage = " * Main Directory: " + $mainDirectory
    write-host $mainDirectoryMessage -ForegroundColor blue

    # Get mx-packer directory.
    $mxPackerDirectory = $mainDirectory + "\js\plugins\mx-agent"
    $mxPackerDirectoryMessage = " * MX Packer Directory: " + $mxPackerDirectory
    write-host $mxPackerDirectoryMessage -ForegroundColor blue

    # Remove and recreate MX Packer Directory.
    [void](Remove-Item -LiteralPath $mxPackerDirectory -Recurse -Force)
    [void](New-Item -Path $mxPackerDirectory -itemType Directory)
    $removeMessage = " * MX Packer directory has been removed and recreated."
    write-host $removeMessage -ForegroundColor blue

    # Write a new script.
    $mxPackerInitJs = $mxPackerDirectory + "\init.js"
    [void](New-Item -Path $mxPackerInitJs)
    [void](Set-Content -LiteralPath $mxPackerInitJs "console.log('The MX Agent has been removed. You cannot use functions associated with it.');")
    $createMessage = " * A new blank script has been created."
    write-host $createMessage -ForegroundColor blue

    # Done.
    write-host "Uninstall is completed successfully." -ForegroundColor red    
} else {
	write-host "Uninstall has been canceled." -ForegroundColor red    
}