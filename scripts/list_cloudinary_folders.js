const fs = require('fs')
const path = require('path')
const { v2: cloudinary } = require('cloudinary')

const envFile = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envFile)) {
  const env = fs.readFileSync(envFile,'utf8')
  env.split(/\n/).forEach(l=>{const t=l.trim(); if(!t||t.startsWith('#')) return; const i=t.indexOf('='); if(i===-1) return; let v=t.slice(i+1); if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1); process.env[t.slice(0,i)]=v})
}

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET })

async function main(){
  let next_cursor = undefined
  const folders = new Map()
  let scanned = 0
  do{
    const res = await cloudinary.api.resources({ resource_type: 'image', type: 'upload', max_results: 500, next_cursor })
    const resources = res.resources || []
    for(const r of resources){
      scanned++
      const folder = String(r.folder || '(root)')
      folders.set(folder, (folders.get(folder) || 0) + 1)
    }
    next_cursor = res.next_cursor
  } while(next_cursor)
  console.log('scanned', scanned)
  console.log('folders:')
  for(const [k,v] of folders.entries()) console.log(k, v)
}

main().catch(e=>{console.error(e)})
