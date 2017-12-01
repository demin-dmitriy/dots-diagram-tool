const Download = (function(){
    
    "use strict";

    const a = document.createElement("a");

    function download(data, fileName)
    {
        const blob = new Blob([data], {type: "octet/stream"});
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    return {
        download: download
    };

}());
