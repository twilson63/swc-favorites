import { test } from 'uvu'
import * as assert from 'uvu/assert'
import ArLocalPkg from 'arlocal'
import Arweave from 'arweave'
import { SmartWeaveNodeFactory, LoggerFactory } from 'redstone-smartweave'
import fs from 'fs'

test('add tx to contract', async () => {
  // start arlocal
  const arLocal = new ArLocalPkg.default(1984, false)
  await arLocal.start()

  const arweave = Arweave.init({
    host: 'localhost',
    port: 1984,
    protocol: 'http'
  })
  LoggerFactory.INST.logLevel('error');
  const smartweave = SmartWeaveNodeFactory.memCachedBased(arweave).build();

  // generate wallet
  const wallet = await arweave.wallets.generate()
  const wallet2 = await arweave.wallets.generate()
  const addr = await arweave.wallets.jwkToAddress(wallet)
  const addr2 = await arweave.wallets.jwkToAddress(wallet2)

  await arweave.api.get(`mint/${addr}/10000000000000000`)
  await arweave.api.get(`mint/${addr2}/10000000000000000`)
  const mine = () => arweave.api.get('mine')
  await mine()
  // deploy contract
  const contractSrc = fs.readFileSync('./contract.js', 'utf-8')
  //const initState = fs.readFileSync('./contract.json', 'utf-8')
  try {
    // add tx
    const contractTxId = await smartweave.createContract.deploy({
      wallet,
      initState: JSON.stringify({ owner: addr, favorites: [] }),
      src: contractSrc
    }, false)
    await mine()

    const contract = smartweave.contract(contractTxId).connect(wallet)
    // add trx successfully
    await contract.writeInteraction({ function: 'add', tx: '1234' })
    await mine()

    const { state } = await contract.readState()
    await mine()

    assert.equal(state.favorites[0], '1234')

    // remove tx successfully
    await contract.writeInteraction({ function: 'remove', tx: '1234' })
    await mine()
    const res = await contract.readState()
    assert.equal(res.state.favorites.length, 0)

    // cant' add tx if I don't own the contract
    const contract2 = smartweave.contract(contractTxId).connect(wallet2)
    await contract2.writeInteraction({ function: "add", tx: '54321' })
    await mine()

    const result = await contract2.readState()
    assert.equal(result.state.favorites.length, 0)


  } catch (e) {
    console.log('ERROR: ', e.message)
  }


  await arLocal.stop()

})

test.run()