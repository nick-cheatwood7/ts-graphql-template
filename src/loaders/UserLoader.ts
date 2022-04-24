import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import DataLoader from "dataloader";
import { User } from "../entities/User";

export const createUserLoader = (orm: MikroORM<IDatabaseDriver<Connection>>) =>
  new DataLoader<string, User>(async (userIds) => {
    const em = orm.em.fork();
    const users = await em.find(User, { id: [userIds as any] });
    const userIdToUser: Record<string, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });
    return userIds.map((userId) => userIdToUser[userId]);
  });
