import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Track} from '../../../models/Track';
import {WebPlayerState} from '../../web-player-state.service';
import {Player} from '../../player/player.service';
import {Album, ALBUM_MODEL} from '../../../models/Album';
import {TrackPlays} from '../../player/track-plays.service';
import {MediaListItemComponent} from '../media-list-item/media-list-item.component';

@Component({
    selector: 'track-embed',
    templateUrl: './track-embed.component.html',
    styleUrls: ['./track-embed.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [WebPlayerState],
})
export class TrackEmbedComponent implements OnInit {
    public media: Track|Album;
    @ViewChild(MediaListItemComponent) mediaListItem: MediaListItemComponent;

    constructor(
        private route: ActivatedRoute,
        private state: WebPlayerState,
        private el: ElementRef<HTMLElement>,
        public player: Player,
        private trackPlays: TrackPlays,
    ) {}

    ngOnInit() {
        this.state.scrollContainer = this.el;
        const data = this.route.snapshot.data;
        this.media = data.api.track || data.api.album;

        let activeTrack: Track;

        if (this.isAlbum(this.media)) {
            activeTrack = this.media.tracks[0];
            this.el.nativeElement.classList.add('album');
        } else {
            activeTrack = this.media;
            this.el.nativeElement.classList.add('track');
        }

        this.player.initForEmbed(activeTrack);

        this.player.state.onChange$.subscribe(type => {
            if (type === 'PLAYBACK_ENDED') {
                this.trackPlays.clearPlayedTrack(this.player.getCuedTrack());
                this.player.playNext();
                this.mediaListItem.activeTrack = this.player.getCuedTrack();
            }
        });
    }

    public isAlbum(media: Track|Album): media is Album {
        return media.model_type === ALBUM_MODEL;
    }
}
