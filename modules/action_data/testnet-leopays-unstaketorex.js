const hyperionModule = {
    chain: "07032d693384fab3ca2e89436baeda5c2f8bf8638af2a2075666487b6e1f47d9",
    contract: 'lpc',
    action: 'unstaketorex',
    parser_version: ['1.8', '1.7'],
    handler: (action) => {
        // attach action extras here
        const data = action['act']['data'];
        let cpu_qtd = null;
        let net_qtd = null;
        if (data['from_net'] && data['from_cpu']) {
            cpu_qtd = parseFloat(data['from_cpu'].split(' ')[0]);
            net_qtd = parseFloat(data['from_net'].split(' ')[0]);
        }
        action['@unstaketorex'] = {
            amount: cpu_qtd + net_qtd,
            owner: data['owner'],
            receiver: data['receiver']
        };
    }
};

module.exports = { hyperionModule };
