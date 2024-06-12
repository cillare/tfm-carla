export class ObservationDTO {
  id: string = '';
  species: string = '';
  amount: number = 0;
  age: string = '';
  sex: string = '';
  province: string = '';
  location: string = '';
  latitude: number = 0;
  initial_date: Date = new Date();
  final_date: Date = new Date();
  observer: string = '';
  image: string = '';
  longitude: number = 0;
}
