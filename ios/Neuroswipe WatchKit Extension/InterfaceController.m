//
//  InterfaceController.m
//  Neuroswipe WatchKit Extension
//
//  Created by Alexander Kern on 6/27/15.
//  Copyright (c) 2015 Alexander Kern. All rights reserved.
//

#import "InterfaceController.h"


@interface InterfaceController()

@end


@implementation InterfaceController

- (void)awakeWithContext:(id)context {
    [super awakeWithContext:context];
    [self newImage];
}

- (void)willActivate {
    // This method is called when watch view controller is about to be visible to user
    [super willActivate];
}

- (void)didDeactivate {
    // This method is called when watch view controller is no longer visible
    [super didDeactivate];
}

- (IBAction)falseClicked {
    [self classify:NO];
}

- (IBAction)trueClicked {
    [self classify:YES];
}

- (void)classify:(BOOL)answer {
    NSURL *url = [NSURL URLWithString: @"http://localhost:3000/classify"];
    
    NSString *id = _imageID;
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
    [request setHTTPMethod:@"POST"];
    NSString *answerString = answer ? @"true" : @"false";
    NSString *postString = [NSString stringWithFormat:@"id=%@&answer=%@", id, answerString];
    [request setHTTPBody:[postString dataUsingEncoding:NSUTF8StringEncoding]];
    [NSURLConnection sendAsynchronousRequest:request queue:[NSOperationQueue mainQueue] completionHandler:^(NSURLResponse *response, NSData *data, NSError *connectionError) {
        NSLog(@"Classified image %@ as %@", id, answerString);
        [self newImage];
    }];
}

- (void)newImage {
    NSLog(@"Retrieving new image...");

    [_falseButton setEnabled:NO];
    [_trueButton setEnabled:NO];
    
    NSURL *url = [NSURL URLWithString: @"http://localhost:3000/new"];
    
    NSURLSessionDownloadTask *downloadImageTask = [[NSURLSession sharedSession] downloadTaskWithURL:url completionHandler:^(NSURL *location,  NSURLResponse *response, NSError *error) {
        UIImage *downloadedImage = [UIImage imageWithData:[NSData dataWithContentsOfURL:location]];
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *) response;
        if (httpResponse.statusCode == 404) {
            NSLog(@"No more images left to classify!");
            [_image setHidden:YES];
            [_doneLabel setHidden:NO];
        } else {
            _imageID = httpResponse.allHeaderFields[@"X-Image-ID"];
            NSLog(@"Image downloaded with ID %@", _imageID);
            [_image setImage:downloadedImage];
            [_falseButton setEnabled:YES];
            [_trueButton setEnabled:YES];
        }
    }];
    
    [downloadImageTask resume];
}

@end



