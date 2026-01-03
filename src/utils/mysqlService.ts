import mysql from 'mysql2/promise';
import { dbInfo } from '../config.json';
import { Pearl } from '../models/Pearl';
import { PearlSector } from '../models/PearlSector';

const pool = mysql.createPool({
    host: dbInfo.host,
    port: dbInfo.port,
    user: dbInfo.user,
    password: dbInfo.password,
    database: dbInfo.database
});

export const executeQuery = async <T>(sql: string, params: any[] = []): Promise<T[]> => {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
};

export const addPearl = async (pearl: Pearl): Promise<number> => {
    const sql = 'INSERT INTO pearls (x, y, color, sector, created_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP())';
    const [result] = await pool.execute(sql, [pearl.x, pearl.y, pearl.color, pearl.sector]);
    return (result as mysql.ResultSetHeader).insertId;
}

export const getTodaysPearls = async (): Promise<Pearl[]> => {
    const sql = 'SELECT * FROM pearls WHERE created_at >= UTC_DATE()';
    const [rows] = await pool.execute(sql);
    return rows as Pearl[];
}

export const getYesterdaysPearls = async (): Promise<Pearl[]> => {
    const sql = 'SELECT * FROM pearls WHERE created_at >= UTC_DATE() - INTERVAL 1 DAY AND created_at < UTC_DATE()';
    const [rows] = await pool.execute(sql);
    return rows as Pearl[];
}

export const deletePearl = async (x: number, y: number, sector: PearlSector): Promise<number> => {
    const sql = 'DELETE FROM pearls WHERE x = ? AND y = ? AND sector = ? AND created_at >= UTC_DATE()';
    const [result] = await pool.execute(sql, [x, y, sector]);
    return (result as mysql.ResultSetHeader).affectedRows;
}

export const getAllPearls = async (): Promise<Pearl[]> => {
    const sql = 'SELECT * FROM pearls';
    const [rows] = await pool.execute(sql);
    return rows as Pearl[];
}

export const deleteOldPearls = async (days: number): Promise<number> => {

    const sql = 'DELETE FROM pearls WHERE created_at < UTC_DATE() - INTERVAL ? DAY';

    const [result] = await pool.execute(sql, [days]);
    return (result as mysql.ResultSetHeader).affectedRows;

}
