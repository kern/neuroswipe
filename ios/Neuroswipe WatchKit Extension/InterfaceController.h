//
//  InterfaceController.h
//  Neuroswipe WatchKit Extension
//
//  Created by Alexander Kern on 6/27/15.
//  Copyright (c) 2015 Alexander Kern. All rights reserved.
//

#import <WatchKit/WatchKit.h>
#import <Foundation/Foundation.h>

@interface InterfaceController : WKInterfaceController

- (IBAction)falseClicked;
- (IBAction)trueClicked;

@property (weak, nonatomic) IBOutlet WKInterfaceLabel *doneLabel;
@property (strong, nonatomic) NSString *imageID;
@property (weak, nonatomic) IBOutlet WKInterfaceImage *image;
@property (weak, nonatomic) IBOutlet WKInterfaceButton *falseButton;
@property (weak, nonatomic) IBOutlet WKInterfaceButton *trueButton;

@end
