import db from '../database/models/index';
import { Request, Response } from 'express';

const getStates = async (req: Request, res: Response) => {
    db.states.findAll().then((states: any) => {
        res.status(200).json({data: states.map((state: any) => ({id: state.id, name: state.name}))})
    }).catch((err: any) => {
        res.status(500).json({error: err})
    })
}

const getPopulationByState = async (req: Request, res: Response) => {
    const stateId = req.params.id;
    db.states.findOne({
        where: {
            id: stateId
        }
    }).then((state: any) => {
        if(state) {
            db.sequelize.query(`SELECT p.first_name, p.last_name, p.coordinates FROM populations p JOIN States s ON ST_Within(p.coordinates::geometry, s.coordinates::geometry) WHERE s.id=${stateId}`, { type: db.sequelize.QueryTypes.SELECT }).then((population: any) => {
                return res.status(200).json({data: population})
            }).catch((err: any) => {
                return res.status(500).json({error: err})
            });
        } else {
            return res.status(404).json({error: 'State not found'})
        }
    }).catch((err: any) => {
        return res.status(500).json({error: err})
    });
}

export {
    getStates,
    getPopulationByState
}