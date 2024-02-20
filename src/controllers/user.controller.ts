import { User } from '../models'

export class UserController {
    private static users: User[] = []

    static addUser(user: User) {
        if (
            UserController.users.find(
                (u) => u.name === user.name && u.password === user.password
            )
        ) {
            user.setError('User already exists')
        }
        UserController.users.push(user)

        return user.meta
    }

    static getUser(userId: number) {
        return UserController.users.find((user) => user.index === userId)
    }

    static getAllUsers() {
        return UserController.users
    }

    static getUsersByIds(ids: number[]) {
        return UserController.users.filter((user) => ids.includes(user.index))
    }
}
