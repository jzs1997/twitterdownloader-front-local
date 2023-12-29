
/**
 * Cut url into a sequence of string, return the last one which is the status id
 * @param {String} url 
 * @returns {String} status id
 */
export default function statusIdExtract(url){
    if(url === null) return null;
    const seq = url.split('/');
    const statusId = seq.at(-1);
    console.log("Status Id is:" + statusId);
    return statusId;
}

export function getFileName(disposition){
    const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-\.]+)(?:; ?|$)/i;
    const asciiFilenameRegex = /^filename=(["']?)(.*?[^\\])\1(?:; ?|$)/i;

    let fileName = null;
    if (utf8FilenameRegex.test(disposition)) {
      fileName = decodeURIComponent(utf8FilenameRegex.exec(disposition)[1]);
    } else {
      // prevent ReDos attacks by anchoring the ascii regex to string start and
      //  slicing off everything before 'filename='
      const filenameStart = disposition.toLowerCase().indexOf('filename=');
      if (filenameStart >= 0) {
        const partialDisposition = disposition.slice(filenameStart);
        const matches = asciiFilenameRegex.exec(partialDisposition );
        if (matches != null && matches[2]) {
          fileName = matches[2];
        }
      }
    }
    return fileName;
}

// statusIdExtract('https://twitter.com/mizukitoko/status/1722128967019409539');
