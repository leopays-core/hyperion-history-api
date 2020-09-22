const hyperionModule = {
    chain: "07032d693384fab3ca2e89436baeda5c2f8bf8638af2a2075666487b6e1f47d9",
    contract: 'lpc',
    action: 'buyrex',
    parser_version: ['1.8', '1.7'],
    handler: (action) => {
        // attach action extras here
        const data = action['act']['data'];
        let qtd = null;
        if (data['amount']) {
            qtd = parseFloat(data['amount'].split(' ')[0]);
        }
        action['@buyrex'] = {
            amount: qtd,
            from: data['from']
        };
    }
};

module.exports = { hyperionModule };
