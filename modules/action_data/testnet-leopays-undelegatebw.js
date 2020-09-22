const hyperionModule = {
    chain: "07032d693384fab3ca2e89436baeda5c2f8bf8638af2a2075666487b6e1f47d9",
    contract: 'lpc',
    action: 'undelegatebw',
    parser_version: ['1.8', '1.7'],
    handler: (action) => {
        // attach action extras here
        const data = action['act']['data'];
        let cpu_qtd = null;
        let net_qtd = null;
        if (data['unstake_net_quantity'] && data['unstake_cpu_quantity']) {
            cpu_qtd = parseFloat(data['unstake_cpu_quantity'].split(' ')[0]);
            net_qtd = parseFloat(data['unstake_net_quantity'].split(' ')[0]);
        }
        action['@undelegatebw'] = {
            amount: cpu_qtd + net_qtd,
            unstake_cpu_quantity: cpu_qtd,
            unstake_net_quantity: net_qtd,
            from: data['from'],
            receiver: data['receiver']
        };
        delete action['act']['data'];
    }
};

module.exports = { hyperionModule };
