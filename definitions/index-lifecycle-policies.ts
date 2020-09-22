import { IlmPutLifecycle } from "@elastic/elasticsearch/api/requestParams";

export const ILPs: IlmPutLifecycle[] = [
    {
        policy: "50G30D",
        body: {
            policy: {
                phases: {
                    hot: {
                        min_age: "0ms",
                        actions: {
                            rollover: {
                                max_age: "30d",
                                max_size: "50gb"
                            },
                            set_priority: {
                                priority: 100
                            }
                        }
                    }
                }
            }
        }
    },
    {
        policy: "10G30D",
        body: {
            policy: {
                phases: {
                    hot: {
                        min_age: "0ms",
                        actions: {
                            rollover: {
                                max_age: "30d",
                                max_size: "10gb",
                                max_docs: 100000000
                            },
                            set_priority: {
                                priority: 100
                            }
                        }
                    }
                }
            }
        }
    },
    {
        policy: "20G30D",
        body: {
            policy: {
                phases: {
                    hot: {
                        min_age: "0ms",
                        actions: {
                            rollover: {
                                max_age: "30d",
                                max_size: "20gb",
                                max_docs: 100000000
                            },
                            set_priority: {
                                priority: 100
                            }
                        }
                    }
                }
            }
        }
    }
];
