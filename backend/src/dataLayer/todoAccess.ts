import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = new AWS.S3({signatureVersion: 'v4'}),
    private readonly todoTable = process.env.TODOs_TABLE,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {
  }

  async getAllTODOs(userId: string): Promise<TodoItem[]> {
    console.log('Getting all groups for ' + userId)

    const result = await this.docClient.query({
      TableName: this.todoTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()
  
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todoItem
    }).promise()

    console.log("Create todo done.")
    return todoItem
  }

  async updateTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.update({
      TableName: this.todoTable,
      Key: {
          "userId": todoItem.userId,
          "todoId": todoItem.todoId
      },
      UpdateExpression: 'set #namefield = :name, done = :done, dueDate = :dueDate',
      ExpressionAttributeValues: {
          ':name': todoItem.name,
          ':done': todoItem.done,
          ':dueDate': todoItem.dueDate
        },
      ExpressionAttributeNames:{
         "#namefield": "name"
        },
      ReturnValues: 'UPDATED_NEW'
    }).promise()

    return todoItem
  }

  async deleteTodo(userId: string, todoId: string): Promise<string> {
    await this.docClient.delete({
      TableName: this.todoTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
    }
    ).promise()
    return ""
  }

  async updateImageURL(userId: string, todoId: string, imageId: string): Promise<string> {
    const imageURL =  `https://${this.bucketName}.s3.amazonaws.com/${imageId}`

    await this.docClient.update({
      TableName: this.todoTable,
      Key: {
          "userId": userId,
          "todoId": todoId
      },
      UpdateExpression: 'set attachmentUrl = :url',
      ExpressionAttributeValues: {
          ':url': imageURL
        },
      ReturnValues: 'UPDATED_NEW'
    }).promise()

    return imageURL
  }

  getUploadUrl(imageId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration
    })
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}


