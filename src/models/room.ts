import { User } from './user'

export class Room {
    roomId: number = Date.now()
    roomUsers: User[] = []

    addUser(user: User) {
        this.roomUsers.push(user)
    }
}
