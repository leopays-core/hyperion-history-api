const hyperionModule = {
    chain: "*",
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
