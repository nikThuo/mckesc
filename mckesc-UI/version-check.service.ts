import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VersionCheckService {
	// this will be replaced by actual hash post-build.js
	private currentHash = '{{POST_BUILD_ENTERS_HASH_HERE}}';
	// private url = '../../../../build/version.json';
	private url = '../../../../pk/version.json';
	data: any;

	constructor(private http: HttpClient) {}

	/**
	 * Checks in every set frequency the version of frontend application
	 * @param url
	 * @param {number} frequency - in milliseconds, defaults to 30 minutes
	 */
	public initVersionCheck(frequency = 1000 * 60 * 60) {
		this.checkVersion();
		setInterval(() => {
			this.checkVersion();
		}, frequency);
	}

	/**
	 * Will do the call and check if the hash has changed or not
	 * @param url
	 */
	private checkVersion() {
		// timestamp these requests to invalidate caches
		this.getData().subscribe(response=>{
			this.data = response;
			const hash = this.data.hash;
			const hashChanged = this.hasHashChanged(this.currentHash, hash);
			// If new version, do something
			if (hashChanged) {
				console.log('hashChanged');
				  if( localStorage ){
				    if( !localStorage.getItem( 'firstLoad' ) ){
							console.log('if');
				      localStorage[ 'firstLoad' ] = true;
				      location.reload();
				    }else{
							console.log('else');
				    	localStorage.removeItem( 'firstLoad' );
				    }
				  };
				// ENTER YOUR CODE TO DO SOMETHING UPON VERSION CHANGE
				// for an example: location.reload();
			}
			// store the new hash so we wouldn't trigger versionChange again
			// only necessary in case you did not force refresh
			this.currentHash = hash;
		},
		(err) => {
			console.error(err, 'Could not get version');
		});
	}

	getData() {
		// timestamp these requests to invalidate caches
		let response = this.http.get(this.url + '?t=' + new Date().getTime());
		return response;
	}

	/**
	 * Checks if hash has changed.
	 * This file has the JS hash, if it is a different one than in the version.json
	 * we are dealing with version change
	 * @param currentHash
	 * @param newHash
	 * @returns {boolean}
	 */
	private hasHashChanged(currentHash, newHash) {
		if (currentHash === newHash) {
			console.log('false');
			return false;
		}
		return true;
	}
	// private hasHashChanged(currentHash, newHash) {
	// 	console.log(currentHash, newHash);
	// 	if (!currentHash || currentHash === '{{POST_BUILD_ENTERS_HASH_HERE}}') {
	// 		console.log('false');
	// 		return false;
	// 	}
	// 	return currentHash !== newHash;
	// }
}