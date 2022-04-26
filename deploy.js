import Arweave from 'arweave'
import { SmartWeaveNodeFactory, LoggerFactory } from 'redstone-smartweave'
import fs from 'fs'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const smartweave = SmartWeaveNodeFactory.memCachedBased(arweave)
  .useRedStoneGateway()
  .build({ notCorrupted: true })

const wallet = JSON.parse(fs.readFileSync('./mywallet.json', 'utf-8'))
const src = fs.readFileSync('./contract.js', 'utf-8')

console.log(await smartweave.createContract.deploy({
  wallet,
  initState: JSON.stringify({ owner: '', favorites: [] }),
  src
})
)