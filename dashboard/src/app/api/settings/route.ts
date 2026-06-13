import { getPlantSettings, isValidPlant } from '@/lib/plants';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PlantSettings from '@/models/PlantSettings';

export async function GET() {
  try {
    await connectDB();
    const settings = await PlantSettings.findOne().sort({ updatedAt: -1 });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { plantName } = await req.json();

    if (!isValidPlant(plantName)) {
      return NextResponse.json(
        { error: `Plant "${plantName}" not found!` },
        { status: 400 }
      );
    }

    const settings = getPlantSettings(plantName);

    if (!settings) {
      return NextResponse.json(
        { error: `Settings for plant "${plantName}" not found.` },
        { status: 500 }
      );
    }

    let dbSettings = await PlantSettings.findOne();

    const settingsData = {
      plantName: settings.englishName,
      englishName: settings.englishName,
      arabicName: settings.arabicName,
      scientificName: settings.scientificName,

      minMoisture: settings.minMoisture,
      maxMoisture: settings.maxMoisture,

      minTemperature: settings.minTemperature,
      maxTemperature: settings.maxTemperature,

      minHumidity: settings.minHumidity,
      maxHumidity: settings.maxHumidity,

      lightRequirement: settings.lightRequirement,

      updatedAt: new Date(),
    };

    if (dbSettings) {
      Object.assign(dbSettings, settingsData);
      await dbSettings.save();
    } else {
      dbSettings = new PlantSettings(settingsData);
      await dbSettings.save();
    }

    return NextResponse.json(
      { message: 'Settings saved!', data: dbSettings },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}