const hyperionModule = {
    chain: "07032d693384fab3ca2e89436baeda5c2f8bf8638af2a2075666487b6e1f47d9",
    contract: 'lpc',
    action: 'buyrambytes',
    parser_version: ['1.8', '1.7'],
    handler: (action) => {
        // attach action extras here
        const data = action['act']['data'];
        action['@buyrambytes'] = {
            bytes: parseInt(data['bytes']),
            payer: data['payer'],
            receiver: data['receiver'],
        };
        delete action['act']['data'];
    }
};

module.exports = { hyperionModule };
