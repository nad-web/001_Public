import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
export async function releaseAssets(){
 const files=['index.html','offline.html','manifest.webmanifest'];
 for(const dir of ['src','assets'])await walk(dir);
 async function walk(dir){for(const item of await fs.readdir(new URL(dir+'/',root),{withFileTypes:true})){const path=dir+'/'+item.name;if(item.isDirectory())await walk(path);else if(!/\.(?:md|txt|json)$/.test(path))files.push(path);}}
 return files.sort();
}
export async function generateWorker(){
 const files=await releaseAssets();const digest=createHash('sha256');
 for(const file of files){digest.update(file);digest.update(await fs.readFile(new URL(file,root)));}
 const revision='1.1.0-'+digest.digest('hex').slice(0,14);
 const source=(await fs.readFile(new URL('scripts/cache-template.js',root),'utf8')).replace('__REVISION__',revision).replace('__FILES__',JSON.stringify(files));
 await fs.writeFile(new URL('sw.js',root),source);return {revision,files};
}
if(process.argv[1]&&new URL('file://'+process.argv[1]).href===import.meta.url){const {revision,files}=await generateWorker();console.log(`${revision}: ${files.length} offline resources`);}
