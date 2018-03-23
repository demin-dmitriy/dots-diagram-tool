const a = document.createElement("a");

export function download(data, fileName)
{
    const blob = new Blob([data], {type: "octet/stream"});
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}
