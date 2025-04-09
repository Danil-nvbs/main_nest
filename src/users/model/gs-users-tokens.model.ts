import { ApiProperty } from "@nestjs/swagger";
import { AfterCreate, Column, DataType, Model, Table } from "sequelize-typescript"

interface GsUserTokenCreationAttrs {
    email: string;
    hash: string;
}

@Table({
    tableName: 'gs_user_tokens',
    timestamps: false,
})

export class GsUserToken extends Model<GsUserToken, GsUserTokenCreationAttrs> {
    @ApiProperty({example: 'user@mail.ru', description:'Адрес электронной почты'})
    @Column({type: DataType.STRING, unique: true, primaryKey: true})
    email: string;
    
    @Column({type: DataType.STRING, unique: true, primaryKey: true})
    hash: string;

    @AfterCreate 
    static removeHash(instance: GsUserToken) {
        delete instance.dataValues.hash;
    }
}