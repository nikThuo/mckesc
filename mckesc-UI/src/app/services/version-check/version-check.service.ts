import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VersionCheckService {
	// this will be replaced by actual hash post-build.js
  
	public currentHash = localStorage.getItem('current-hash');
	// prod
	private url = '../../../../mckesc/static/version.json';

	// dev
	// private url = '../../../../mckesc/version.json';
	
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
			if( !localStorage.getItem( 'default-hash') ){
				localStorage.setItem('default-hash', '');
			}else{
				const hashChanged = this.hasHashChanged(localStorage.getItem('default-hash'), hash);
				// If new version, do something
				if (hashChanged) {
					if (localStorage) {
				    if( !localStorage.getItem( 'firstLoad' ) ){
							var okToRefresh = confirm("The site has new updates. Click OK to update. Note that unsaved data will be lost.");
							if(okToRefresh){
								localStorage.removeItem('default-hash');
								localStorage.setItem('default-hash', hash);
					      localStorage[ 'firstLoad' ] = true;
					      location.reload();
					    }
				    }else{
				    	localStorage.removeItem( 'firstLoad' );
				    }
					}
				}
			}
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
			return false;
		}
		return true;
	}
	// private hasHashChanged(currentHash, newHash) {
	// 	console.log(currentHash, newHash);
	// 	if (!currentHash || currentHash === '04754394a38c0825e5b7') {
	// 		console.log('false');
	// 		return false;
	// 	}
	// 	return currentHash !== newHash;
	// }
}