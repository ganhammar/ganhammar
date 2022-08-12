const util = require('util');
const exec = util.promisify(require('child_process').exec);

class GetCertificateArn {
    constructor() {
        this.configurationVariablesSources = {
            getCertificateArn: {
                async resolve({ params: [region, targetDomainName] }) {
                    const { stdout, stderr } = await exec(`aws acm list-certificates --region ${region}`);

                    if (stderr) {
                        return console.log(stderr);
                    }

                    const certificates = JSON.parse(stdout);
                    const certificate = certificates.CertificateSummaryList
                        .find(({ DomainName }) => DomainName === targetDomainName);

                    if (certificate) {
                        return {
                            value: certificate.CertificateArn,
                        };
                    }
                }
            },
        }
    }
}

module.exports = GetCertificateArn;
