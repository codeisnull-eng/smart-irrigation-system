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

    let dbSettings = await PlantSettings.findOne();
    
    if (dbSettings) {
      dbSettings.plantName = plantName;
      dbSettings.minMoisture = settings.minMoisture;
      dbSettings.maxMoisture = settings.maxMoisture;
      dbSettings.minTemperature = settings.minTemperature;
      dbSettings.maxTemperature = settings.maxTemperature;
      await dbSettings.save();
    } else {
      dbSettings = new PlantSettings({
        plantName,
        minMoisture: settings.minMoisture,
        maxMoisture: settings.maxMoisture,
        minTemperature: settings.minTemperature,
        maxTemperature: settings.maxTemperature,
      });
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