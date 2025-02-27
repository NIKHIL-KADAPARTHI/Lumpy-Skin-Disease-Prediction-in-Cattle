export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  cloud_cover: number;
  vapor_pressure: number;
  latitude: number;
  longitude: number;
  area: string;
  country: string;
  error?: string;
}

export interface CattleAssessment {
  id?: string;
  user_id: string;
  cattle_uid: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  address: string;
  area: string;
  country: string;
  body_temperature: number;
  skin_lesions: string;
  loss_of_appetite: string;
  increased_mosquito: string;
  reduced_milk: string;
  high_mucosal: string;
  lymph_enlargement: string;
  laziness: string;
  weather_temperature: number;
  humidity: number;
  precipitation: number;
  cloud_cover: number;
  vapor_pressure: number;
  model_assessment: string;
  rt_pcr_result?: string;
}