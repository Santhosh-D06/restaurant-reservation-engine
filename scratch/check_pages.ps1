$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $docPath = "c:\Users\DELL\Documents\FSD\restaurant-reservation-engine\docs\TableEase_Project_Report.docx"
    $doc = $word.Documents.Open($docPath, $false, $true)
    $pages = $doc.ComputeStatistics(2)
    Write-Host "PAGE_COUNT: $pages"
    
    foreach ($term in @("SCREENSHOTS OF THE PROJECT", "Figure 1", "Figure 2", "Figure 3", "Figure 4", "Figure 5", "Figure 6", "REFERENCES")) {
        $range = $doc.Content
        $found = $range.Find.Execute($term)
        if ($found) {
            $pageNum = $range.Information(1)
            Write-Host "$term is on page: $pageNum"
        }
    }
} finally {
    if ($doc) { $doc.Close([Microsoft.Office.Interop.Word.WdSaveOptions]::wdDoNotSaveChanges) }
    $word.Quit()
}
