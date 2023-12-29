
export default function changeExt(filename, ext){
    const seq = filename.split('.');
    return seq[0] + '.' + ext;
}