import { questionaire } from '../question/faceOff'
import { config, DynamoDB } from 'aws-sdk';

const print = console.log;
interface AnswerOption {
    M: {
        value: {
            SS: Array<string>
        };
        display: {
            S: string
        };
        score: {
            N: string
        };
    }
}

interface DatabaseItemFormat {
    Item: {
        QuestionId: {
            N: string
        };
        question: {
            S: string
        };
        answer: any // { M: { [key: string]: AnswerOption } }  //Array<AnswerOption>
    },
    TableName: string
}

interface retrieveData {
    Key: {
        QuestionId: {
            N: string
        }
    },
    TableName: string
};

export class aws {
    private dynamodb;

    constructor() {
        // set the api version globally for simplicity  
        config.apiVersions = {
            dynamodb: '2012-08-10',
            // other service API versions
        };
        config.update({ region: 'us-east-1' });
        this.dynamodb = new DynamoDB();
    }


    async getAllTable() {
        let getTable = await this.dynamodb.listTables({}).promise()
        return getTable;
    }

    async getData(params: retrieveData) {
        let itemsList = await this.dynamodb.getItem(params).promise()
        return itemsList;
    }


    async writeData(params: DatabaseItemFormat) {
        await this.dynamodb.putItem(params).promise();
    }
}

export async function StoreQuestion(awsInstance: aws) {
    for (let question of questionaire) {
        let M: { [key: string]: AnswerOption } = {}
        let item: DatabaseItemFormat;

        let i = 1;
        for (let answerElement in question.answers) {
            let answer: AnswerOption = {
                M: {
                    value: {
                        SS: question.answers[answerElement].value
                    },
                    display: {
                        S: question.answers[answerElement].display
                    },
                    score: {
                        N: question.answers[answerElement].score.toString()
                    }
                }
            }
            M[answerElement] = answer
            i++;
        }

        item = {
            Item: {
                QuestionId: {
                    N: question.id.toString()
                },
                question: {
                    S: question.question
                },
                answer: { M: M }
            },

            TableName: "FamilyFeudQuestion"
        }
        // print(JSON.stringify(item, null, 4))
        await awsInstance.writeData(item);
        print('done');
    }
}

async function main() {
    let awsInstance = new aws();

    StoreQuestion(awsInstance);

    // let data: retrieveData = {
    //     Key: {
    //         QuestionId: {
    //             N: "0"
    //         }
    //     },
    //     TableName: "FamilyFeudQuestion"
    // }


}


main();
