const hyperionModule = {
    chain: "07032d693384fab3ca2e89436baeda5c2f8bf8638af2a2075666487b6e1f47d9",
    contract: 'lpc',
    action: 'voteproducer',
    parser_version: ['1.8', '1.7'],
    mappings: {
        action: {
            "@voteproducer": {
                "properties": {
                    "proxy": { "type": "keyword" },
                    "producers": { "type": "keyword" }
                }
            }
        }
    },
    handler: (action) => {
        // attach action extras here
        const data = action['act']['data'];
        action['@voteproducer'] = {
            proxy: data['proxy'],
            producers: data['producers']
        };
    }
};

module.exports = { hyperionModule };
