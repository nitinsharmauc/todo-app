import * as uuid from 'uuid'

import { TodoItem } from "../models/TodoItem";
import { TodoAccess } from "../dataLayer/TodoAccess";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { parseUserId } from '../auth/utils'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todoAccess = new TodoAccess()

export async function getAllTodos(jwtToken: string) : Promise<TodoItem[]> {
    return todoAccess.getAllTODOs(parseUserId(jwtToken))
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {

    const itemId = uuid.v4()
    const userId = parseUserId(jwtToken)
    console.log("Creating todo : ", createTodoRequest)
    console.log("User : ", userId)
    
    return await todoAccess.createTodo({
        userId: userId,
        todoId: itemId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: ""
    })
}

export async function updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {

    const userId = parseUserId(jwtToken)
    console.log("Updating todo : ", updateTodoRequest)
    console.log("User : ", userId)
    
    return await todoAccess.updateTodo({
        userId: userId,
        todoId: todoId,
        createdAt: "",
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done,
        attachmentUrl: ""
    })
}

export async function deleteTodo(
    todoId: string,
    jwtToken: string
): Promise<string> {
    return todoAccess.deleteTodo(parseUserId(jwtToken), todoId)
}

export async function generateUploadUrl(
    todoId: string,
    jwtToken: string
): Promise<string> {

    const imageId = uuid.v4()
    const userId = parseUserId(jwtToken)
    console.log("Getting uploadURL")

    await todoAccess.updateImageURL(userId, todoId, imageId)

    return todoAccess.getUploadUrl(imageId)
}
