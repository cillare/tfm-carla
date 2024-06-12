import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BirdImageService {
  constructor(private http: HttpClient) {}

  private formatSpeciesName(speciesName: string): string {
    return speciesName.trim().replace(/ /g, '+');
  }

  getBirdImage(speciesName: string): Observable<string | null> {
    const formattedName = this.formatSpeciesName(speciesName);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${formattedName}&srnamespace=6&srprop=timestamp&format=json&origin=*`;

    return this.http.get(url).pipe(
      mergeMap((res: any) => {
        const searchResults = res.query?.search;
        if (searchResults && searchResults.length > 0) {
          const pageTitle = searchResults[1].title;
          return this.getImageUrlFromTitle(pageTitle).pipe(
            filter((imageUrl) => imageUrl !== null)
          );
        }
        return of(null);
      }),
      catchError((error) => {
        console.error('Error fetching image:', error);
        return throwError(error);
      })
    );
  }

  private getImageUrlFromTitle(title: string): Observable<string | null> {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${title}&prop=imageinfo&iiprop=url&format=json&origin=*`;

    return this.http.get(url).pipe(
      map((res: any) => {
        const pages = res.query?.pages;
        if (pages) {
          for (let pageId in pages) {
            const page = pages[pageId];
            if (page.imageinfo && page.imageinfo.length > 0) {
              const imageUrl = page.imageinfo[0].url;
              if (this.isImageFile(imageUrl)) {
                return imageUrl;
              }
            }
          }
        }
        return null;
      })
    );
  }

  private isImageFile(url: string): boolean {
    return /\.(jpeg|jpg|gif|png)$/i.test(url);
  }
}
