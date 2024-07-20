import { query } from "express";
import prisma from "../DB/db.config.js";
class EmojiController {
  static async countModus(req, res) {
    const item = await prisma.emoji.groupBy({
      by: ["name"],
      _count: {
        id: true,
      },
    });

    const limits = item.length;

    const aggregations = await prisma.emoji.groupBy({
      by: ["name", "emotion"],
      _count: {
        id: true,
      },
      take: limits,
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    const modus = [];
    aggregations.forEach((element) => {
      modus.push({
        name: element["name"],
        emotion: element["emotion"],
        total: element["_count"]["id"],
      });
    });

    return res.json({
      status: 200,
      modus,
    });
  }

  static async countAverage(req, res) {
    const aggregations = await prisma.emoji.groupBy({
      by: ["name"],
      _avg: {
        score: true,
      },
    });
    const averages = [];
    aggregations.forEach((element) => {
      averages.push({
        name: element["name"],
        total: element["_avg"]["score"],
      });
    });

    return res.json({
      status: 200,
      averages,
    });
  }

  static async countAveMds(req, res) {
    const aggreAverage = await prisma.emoji.groupBy({
      by: ["name", "createdAt"],
      _avg: {
        score: true,
      },
    });
    const averages = [];
    aggreAverage.forEach((element) => {
      averages.push({
        name: element["name"],
        total: element["_avg"]["score"],
        created: element["createdAt"],
      });
    });

    const item = await prisma.emoji.groupBy({
      by: ["name"],
      _count: {
        id: true,
      },
    });

    const limits = item.length;
    const aggreModus = await prisma.emoji.groupBy({
      by: ["name", "emotion", "createdAt"],
      _count: {
        id: true,
      },
      take:limits,
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    const modus = [];
    aggreModus.forEach((element) => {
      modus.push({
        name: element["name"],
        emotion: element["emotion"],
        total: element["_count"]["id"],
        created: element["createdAt"],
      });
    });

    const result = {
      averages: averages,
      modus: modus,
    };

    return res.json({
      status: 200,
      result,
    });
  }
}

export default EmojiController;
