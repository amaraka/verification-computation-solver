const promisify = require("es6-promisify")
const LivepeerVerifierArtifact = require("../artifacts/LivepeerVerifier.json")

class LivepeerVerifierWrapper {
    constructor(web3Wrapper, verifierAddress, account) {
        this.web3Wrapper = web3Wrapper
        this.verifierAddress = verifierAddress
        this.account = account
    }

    async verify(jobId, claimId, segmentNumber, transcodingOptions, dataStorageHash, transcodedDataHash) {
        const verifier = await this.getLivepeerVerifier()
        const gas = await verifier.verify.estimateGasAsync(jobId, claimId, segmentNumber, transcodingOptions, dataStorageHash, transcodedDataHash)
        return await verifier.verify(jobId, claimId, segmentNumber, transcodingOptions, dataStorageHash, transcodedDataHash, {from: this.account, gas: gas})
    }

    async invokeCallback(queryId, result) {
        const verifier = await this.getLivepeerVerifier()
        const gas = await verifier.__callback.estimateGasAsync(queryId, result)
        return await verifier.__callback(queryId, result, {from: this.account, gas: gas})
    }

    async getVerificationCodeHash() {
        const verifier = await this.getLivepeerVerifier()
        return await verifier.verificationCodeHash()
    }

    async subscribeToVerifyRequest() {
        const verifier = await this.getLivepeerVerifier()
        const event = verifier.VerifyRequest({})

        return {
            watch: cb => {
                return event.watch(cb)
            },
            stopWatching: async () => {
                await promisify(event.stopWatching, event)()
            }
        }
    }

    async getLivepeerVerifier() {
        if (this.instance !== undefined) {
            return this.instance
        }

        this.instance = await this.web3Wrapper.getContractInstance(LivepeerVerifierArtifact, this.verifierAddress)

        return this.instance
    }
}

module.exports = LivepeerVerifierWrapper