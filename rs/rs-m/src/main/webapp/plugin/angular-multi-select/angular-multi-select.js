/* 
 * Angular JS Multi Select
 * Creates a dropdown-like button with checkboxes. 
 *
 * Created: Tue, 14 Jan 2014 - 5:18:02 PM
 * 
 * Released under the MIT License
 *
 * --------------------------------------------------------------------------------
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Ignatius Steven (https://github.com/isteven)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to deal 
 * in the Software without restriction, including without limitation the rights 
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
 * copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions: 
 *
 * The above copyright notice and this permission notice shall be included in all 
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 * SOFTWARE.
 * --------------------------------------------------------------------------------
 */

angular.module( 'multi-select', ['ng'] ).directive( 'multiSelect' , [ '$sce', '$timeout','$translate', function ( $sce, $timeout ,$translate) {
    return {
        restrict: 
            'AE',

        replace: 
            true,

        scope: 
        {   
            // models
            inputModel      : '=',
            outputModel     : '=',

            // settings based on attribute
            buttonLabel     : '@',
            defaultLabel    : '@',
            directiveId     : '@',
            helperElements  : '@',            
            isDisabled      : '=',
            itemLabel       : '@',
            maxLabels       : '@',
            orientation     : '@',
            selectionMode   : '@',            
                                                         
            // settings based on input model property 
            tickProperty    : '@',
            disableProperty : '@',
            groupProperty   : '@',
            maxHeight       : '@',

            // callbacks
            onClose         : '&',            
            onItemClick     : '&',
            onOpen          : '&'                        
        },

        template: 
            '<span class="multiSelect inlineBlock">' +        
                '<button type="button" class="button multiSelectButton" ng-click="toggleCheckboxes( $event ); refreshSelectedItems(); refreshButton();" ng-bind-html="varButtonLabel">' +
                '</button>' +                              
                '<div class="checkboxLayer">' +                        
                    '<form>' + 
                        '<div class="helperContainer" ng-if="displayHelper( \'filter\' ) || displayHelper( \'all\' ) || displayHelper( \'none\' ) || displayHelper( \'reset\' )">' +
//                            '<div class="line" ng-if="displayHelper( \'all\' ) || displayHelper( \'none\' ) || displayHelper( \'reset\' )">' +
//                                '<button type="button" ng-click="select( \'all\',   $event );"    class="helperButton" ng-if="!isDisabled && displayHelper( \'all\' )">   &#10003;&nbsp; '+$translate.instant('selectAll')+'</button> ' +
//                                '<button type="button" ng-click="select( \'none\',  $event );"   class="helperButton" ng-if="!isDisabled && displayHelper( \'none\' )">  &#10007;&nbsp; '+$translate.instant('selectNone')+'</button>&nbsp;' +
//                                '<button type="button" ng-click="select( \'reset\', $event );"  class="helperButton" ng-if="!isDisabled && displayHelper( \'reset\' )" style="float:right">&#8630;&nbsp; '+$translate.instant('reset')+'</button>' +
//                            '</div>' +
                            '<div class="line" style="position:relative" ng-if="displayHelper( \'filter\' )">' +
                                '<input placeholder="'+$translate.instant('search')+'..." type="text" ng-click="select( \'filter\', $event )" ng-model="inputLabel.labelFilter" ng-change="updateFilter();$scope.getFormElements();" class="inputFilter" />' +
//                                '<button type="button" class="clearButton" ng-click="inputLabel.labelFilter=\'\';updateFilter();prepareGrouping();prepareIndex();select( \'clear\', $event )"><img src="/cms/img/icon_delete.png" /></button> ' +
                                '<img src="/sso/img/icon_delete.png"  class="clearButton" ng-click="inputLabel.labelFilter=\'\';updateFilter();prepareGrouping();prepareIndex();select( \'clear\', $event )" /> ' +
                            '</div>' +
                        '</div>' +
                        
                        '<div class="checkBoxContainer" style="{{setHeight();}}">' +
                        
	                        '<div class="multiSelectItem" ng-if="!isDisabled && displayHelper( \'all\' )"' +
		                        'ng-class="{selected: item[ tickProperty ], horizontal: orientationH, vertical: orientationV, multiSelectGroup:item[ groupProperty ], disabled:itemIsDisabled( item )}"' +
		                        'ng-click="selected();"' + 
		                        'ng-mouseleave="removeFocusStyle( tabIndex );">' + 
		                        '<div class="acol" ng-if="item[ spacingProperty ] > 0">&nbsp;</div>' +              
		                        '<div class="acol">' +
			                        '<label>' +
				                        '<img src="/sso/img/icon_rec.png" style="width:14px;height:14px;position:relative;top:-1px;" />' +
				                        '<input class="checkbox focusable" type="checkbox" ng-checked="sflag" />' +
				                        '<span style="font-weight:bold;" ng-click="selected();">&nbsp;'+$translate.instant('selectAll')+'</span>' +
			                        '</label>' +                                
		                        '</div>' +
		                        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 
//		                        '<span class="tickMark" ng-if="sflag">&#10004;</span>' +
	                        '</div>' +
                        
                            '<div ng-repeat="item in filteredModel track by $index | filter:removeGroupEndMarker" class="multiSelectItem"' +
                                'ng-class="{selected: item[ tickProperty ], horizontal: orientationH, vertical: orientationV, multiSelectGroup:item[ groupProperty ], disabled:itemIsDisabled( item )}"' +
                                'ng-click="syncItems( item, $event, $index );"' + 
                                'ng-mouseleave="removeFocusStyle( tabIndex );">' + 
                                '<div class="acol" ng-if="item[ spacingProperty ] > 0" ng-repeat="i in numberToArray( item[ spacingProperty ] ) track by $index">&nbsp;</div>' +              
                                '<div class="acol">' +
                                    '<label>' +
                                    	'<img src="/sso/img/icon_rec.png" style="width:14px;height:14px;position:relative;top:-1px;" ng-disabled="itemIsDisabled( item )" ng-click="syncItems( item, $event, $index )" />' +
                                        '<input class="checkbox focusable" type="checkbox" ng-disabled="itemIsDisabled( item )" ng-checked="item[ tickProperty ]" ng-click="syncItems( item, $event, $index )" />' +
                                        '<span ng-class="{disabled:itemIsDisabled( item )}" ng-bind-html="writeLabel( item, \'itemLabel\' )" style="position:relative;left:-17px;"></span>' +
                                    '</label>' +                                
                                '</div>' +
                                '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 
//                                '<span class="tickMark" ng-if="item[ groupProperty ] !== true && item[ tickProperty ] === true">&#10004;</span>' +
                            '</div>' +
                        '</div>' +
                    '<form>' +
                '</div>' +
            '</span>',

        link: function ( $scope, element, attrs ) {           

            $scope.backUp           = [];
            $scope.varButtonLabel   = '';   
            $scope.scrolled         = false;
            $scope.spacingProperty  = '';
            $scope.indexProperty    = '';            
            $scope.checkBoxLayer    = '';
            $scope.orientationH     = false;
            $scope.orientationV     = true;
            $scope.filteredModel    = [];
            $scope.inputLabel       = { labelFilter: '' };
            $scope.selectedItems    = [];                                    
            $scope.formElements     = [];
            $scope.tabIndex         = 0;
            prevTabIndex            = 0;
            helperItems             = [];
            helperItemsLength       = 0;

            // If user specify a height, call this function
            $scope.setHeight = function() {
                if ( typeof $scope.maxHeight !== 'undefined' ) {
                    return 'max-height: ' + $scope.maxHeight + '; overflow-y:scroll';
                }
            }

            // A little hack so that AngularJS ng-repeat can loop using start and end index like a normal loop
            // http://stackoverflow.com/questions/16824853/way-to-ng-repeat-defined-number-of-times-instead-of-repeating-over-array
            $scope.numberToArray = function( num ) {
                return new Array( num );   
            }

            $scope.updateFilter = function()
            {
                // we check by looping from end of array
                $scope.filteredModel   = [];
                var i = 0;

                if ( typeof $scope.inputModel === 'undefined' ) {
                    return [];                   
                }

                for( i = $scope.inputModel.length - 1; i >= 0; i-- ) {

                    // if it's group end
                    if ( typeof $scope.inputModel[ i ][ $scope.groupProperty ] !== 'undefined' && $scope.inputModel[ i ][ $scope.groupProperty ] === false ) {
                        $scope.filteredModel.push( $scope.inputModel[ i ] );
                    }
                    
                    // if it's data 
                    var gotData = false;
                    if ( typeof $scope.inputModel[ i ][ $scope.groupProperty ] === 'undefined' ) {                        

                        for (var key in $scope.inputModel[ i ] ) {
                            // if filter string is in one of object property                            
                            if ( typeof $scope.inputModel[ i ][ key ] !== 'boolean'  && String( $scope.inputModel[ i ][ key ] ).toUpperCase().indexOf( $scope.inputLabel.labelFilter.toUpperCase() ) >= 0 ) {
                                gotData = true;
                                break;
                            }
                        }                        
                        if ( gotData === true ) {    
                            // push
                            $scope.filteredModel.push( $scope.inputModel[ i ] );
                        }
                    }

                    // if it's group start
                    if ( typeof $scope.inputModel[ i ][ $scope.groupProperty ] !== 'undefined' && $scope.inputModel[ i ][ $scope.groupProperty ] === true ) {

                        if ( typeof $scope.filteredModel[ $scope.filteredModel.length - 1 ][ $scope.groupProperty ] !== 'undefined' && $scope.filteredModel[ $scope.filteredModel.length - 1 ][ $scope.groupProperty ] === false ) {
                            $scope.filteredModel.pop();
                        }
                        else {
                            $scope.filteredModel.push( $scope.inputModel[ i ] );
                        }
                    }
                }                

                $scope.filteredModel.reverse();  
                $timeout( function() {
                    $scope.getFormElements();               
                },0);
            };

            // List all the input elements.
            // This function will be called everytime the filter is updated. Not good for performance, but oh well..
            $scope.getFormElements = function() {                     
                $scope.formElements = [];
                for ( var i = 0; i < element[ 0 ].getElementsByTagName( 'FORM' )[ 0 ].elements.length ; i++ ) { 
                    $scope.formElements.push( element[ 0 ].getElementsByTagName( 'FORM' )[ 0 ].elements[ i ] );
                }
            }            

            // check if an item has $scope.groupProperty (be it true or false)
            $scope.isGroupMarker = function( item , type ) {
                if ( typeof item[ $scope.groupProperty ] !== 'undefined' && item[ $scope.groupProperty ] === type ) return true; 
                return false;
            }

            $scope.removeGroupEndMarker = function( item ) {
                if ( typeof item[ $scope.groupProperty ] !== 'undefined' && item[ $scope.groupProperty ] === false ) return false; 
                return true;
            }
            

            // Show or hide a helper element 
            $scope.displayHelper = function( elementString ) {
                if ( typeof attrs.helperElements === 'undefined' ) {
                    return true;                    
                }
                switch( elementString.toUpperCase() ) {
                    case 'ALL':
                        if ( attrs.selectionMode && $scope.selectionMode.toUpperCase() === 'SINGLE' ) {                            
                            return false;
                        }
                        else {
                            if ( attrs.helperElements && $scope.helperElements.toUpperCase().indexOf( 'ALL' ) >= 0 ) {
                                return true;
                            }
                        }
                        break;
                    case 'NONE':
                        if ( attrs.selectionMode && $scope.selectionMode.toUpperCase() === 'SINGLE' ) {
                            return false;
                        }
                        else {
                            if ( attrs.helperElements && $scope.helperElements.toUpperCase().indexOf( 'NONE' ) >= 0 ) {
                                return true;
                            }
                        }
                        break;
                    case 'RESET':
                        if ( attrs.helperElements && $scope.helperElements.toUpperCase().indexOf( 'RESET' ) >= 0 ) {
                            return true;
                        }
                        break;
                    case 'FILTER':
                        if ( attrs.helperElements && $scope.helperElements.toUpperCase().indexOf( 'FILTER' ) >= 0 ) {
                            return true;
                        }
                        break;                    
                    default:             
                        return false;
                        break;
                }
            }                

            // call this function when an item is clicked
            $scope.syncItems = function( item, e, ng_repeat_index ) {                                                                

                e.preventDefault();
                e.stopPropagation();

                // if it's globaly disabled, then don't do anything
                if ( typeof attrs.disableProperty !== 'undefined' && item[ $scope.disableProperty ] === true ) {                                        
                    return false;
                }

                // don't change disabled items
                if ( typeof attrs.isDisabled !== 'undefined' && $scope.isDisabled === true ) {                        
                    return false;
                }                                

                // we don't care about end of group markers
                if ( typeof item[ $scope.groupProperty ] !== 'undefined' && item[ $scope.groupProperty ] === false ) {
                    return false;
                }                

                index = $scope.filteredModel.indexOf( item );       

                // process items if the start of group marker is clicked ( only for multiple selection! )
                // if, in a group, there are items which are not selected, then they all will be selected
                // if, in a group, all items are selected, then they all will be de-selected                
                if ( typeof item[ $scope.groupProperty ] !== 'undefined' && item[ $scope.groupProperty ] === true ) {                                  

                    if ( attrs.selectionMode && $scope.selectionMode.toUpperCase() === 'SINGLE' ) {
                        return false;
                    }
                    
                    var i,j,k;
                    var startIndex = 0;
                    var endIndex = $scope.filteredModel.length - 1;
                    var tempArr = [];
                    var nestLevel = 0;                    

                    for( i = index ; i < $scope.filteredModel.length ; i++) {  

                        if ( nestLevel === 0 && i > index ) 
                        {
                            break;
                        }
                    
                        // if group start
                        if ( typeof $scope.filteredModel[ i ][ $scope.groupProperty ] !== 'undefined' && $scope.filteredModel[ i ][ $scope.groupProperty ] === true ) {
                            
                            // To cater multi level grouping
                            if ( tempArr.length === 0 ) {
                                startIndex = i + 1; 
                            }                            
                            nestLevel = nestLevel + 1;
                        }                                                

                        // if group end
                        else if ( typeof $scope.filteredModel[ i ][ $scope.groupProperty ] !== 'undefined' && $scope.filteredModel[ i ][ $scope.groupProperty ] === false ) {

                            nestLevel = nestLevel - 1;                            

                            // cek if all are ticked or not                            
                            if ( tempArr.length > 0 && nestLevel === 0 ) {                                

                                var allTicked = true;       

                                endIndex = i;

                                for ( j = 0; j < tempArr.length ; j++ ) {                                
                                    if ( typeof tempArr[ j ][ $scope.tickProperty ] !== 'undefined' &&  tempArr[ j ][ $scope.tickProperty ] === false ) {
                                        allTicked = false;
                                        break;
                                    }
                                }                                                                                    

                                if ( allTicked === true ) {
                                    for ( j = startIndex; j <= endIndex ; j++ ) {
                                        if ( typeof $scope.filteredModel[ j ][ $scope.groupProperty ] === 'undefined' ) {
                                            if ( typeof attrs.disableProperty === 'undefined' ) {
                                                $scope.filteredModel[ j ][ $scope.tickProperty ] = false;
                                                // we refresh input model as well
                                                inputModelIndex = $scope.filteredModel[ j ][ $scope.indexProperty ];
                                                $scope.inputModel[ inputModelIndex ][ $scope.tickProperty ] = false;
                                            }
                                            else if ( $scope.filteredModel[ j ][ $scope.disableProperty ] !== true ) {
                                                $scope.filteredModel[ j ][ $scope.tickProperty ] = false;
                                                // we refresh input model as well
                                                inputModelIndex = $scope.filteredModel[ j ][ $scope.indexProperty ];
                                                $scope.inputModel[ inputModelIndex ][ $scope.tickProperty ] = false;
                                            }
                                        }
                                    }                                
                                }

                                else {
                                    for ( j = startIndex; j <= endIndex ; j++ ) {
                                        if ( typeof $scope.filteredModel[ j ][ $scope.groupProperty ] === 'undefined' ) {
                                            if ( typeof attrs.disableProperty === 'undefined' ) {
                                                $scope.filteredModel[ j ][ $scope.tickProperty ] = true;                                                
                                                // we refresh input model as well
                                                inputModelIndex = $scope.filteredModel[ j ][ $scope.indexProperty ];
                                                $scope.inputModel[ inputModelIndex ][ $scope.tickProperty ] = true;

                                            }                                            
                                            else if ( $scope.filteredModel[ j ][ $scope.disableProperty ] !== true ) {
                                                $scope.filteredModel[ j ][ $scope.tickProperty ] = true;
                                                // we refresh input model as well
                                                inputModelIndex = $scope.filteredModel[ j ][ $scope.indexProperty ];
                                                $scope.inputModel[ inputModelIndex ][ $scope.tickProperty ] = true;
                                            }
                                        }
                                    }                                
                                }                                                                                    
                            }
                        }
            
                        // if data
                        else {                            
                            tempArr.push( $scope.filteredModel[ i ] );                                                                                    
                        }
                    }                                 
                }

                // single item click
                else {
                    $scope.filteredModel[ index ][ $scope.tickProperty ]   = !$scope.filteredModel[ index ][ $scope.tickProperty ];
                    
                    // we refresh input model as well
                    inputModelIndex = $scope.filteredModel[ index ][ $scope.indexProperty ];                    
                    $scope.inputModel[ inputModelIndex ][ $scope.tickProperty ] = $scope.filteredModel[ index ][ $scope.tickProperty ];


                    // If it's single selection mode
                    if ( attrs.selectionMode && $scope.selectionMode.toUpperCase() === 'SINGLE' ) {
                        $scope.filteredModel[ index ][ $scope.tickProperty ] = true;
                        for( i=0 ; i < $scope.filteredModel.length ; i++) {
                            if ( i !== index ) {
                                $scope.filteredModel[ i ][ $scope.tickProperty ] = false;
                            }
                        }        
                        $scope.toggleCheckboxes( e );
                    }
                }  

                $scope.onItemClick( { data: item } );     

                // We update the index here
                prevTabIndex = $scope.tabIndex;
                $scope.tabIndex = ng_repeat_index + helperItemsLength;
                                
                // Set focus on the hidden checkbox 
                e.target.focus();

                // set & remove CSS style
//                $scope.removeFocusStyle( prevTabIndex );
//                $scope.setFocusStyle( $scope.tabIndex );
                $scope.syncSelectAll();
            }     

            // update $scope.selectedItems
            // this variable is used in $scope.outputModel and to refresh the button label
            $scope.refreshSelectedItems = function() {                
                $scope.selectedItems    = [];
                angular.forEach( $scope.inputModel, function( value, key ) {
                    if ( typeof value !== 'undefined' ) {                   
                        if ( typeof value[ $scope.groupProperty ] === 'undefined' ) {
                            if ( value[ $scope.tickProperty ] === true ) {
                                $scope.selectedItems.push( value );                               
                            }
                        }
                    }
                });                                
            }

            // refresh output model as well
            $scope.refreshOutputModel = function() {                
                if ( typeof attrs.outputModel !== 'undefined' ) {            
                    $scope.outputModel = angular.copy( $scope.selectedItems );                    
                    angular.forEach( $scope.outputModel, function( value, key ) {
                        // remove the index number and spacing number from output model
                        delete value[ $scope.indexProperty ];
                        delete value[ $scope.spacingProperty ];      
                    })
                }                                                
            }

            // refresh button label
            $scope.refreshButton = function() {

                $scope.varButtonLabel   = '';                
                ctr                     = 0;                  

                // refresh button label...
                if ( $scope.selectedItems.length === 0 ) {
                    // https://github.com/isteven/angular-multi-select/pull/19                    
                    $scope.varButtonLabel = ( typeof $scope.defaultLabel !== 'undefined' ) ? $scope.defaultLabel :$translate.instant('noneSelected');
                }
                else {                
                    var tempMaxLabels = $scope.selectedItems.length;
                    if ( typeof $scope.maxLabels !== 'undefined' && $scope.maxLabels !== '' ) {
                        tempMaxLabels = $scope.maxLabels;
                    }

                    // if max amount of labels displayed..
                    if ( $scope.selectedItems.length > tempMaxLabels ) {
                        $scope.more = true;
                    }
                    else {
                        $scope.more = false;
                    }                
                
                    angular.forEach( $scope.selectedItems, function( value, key ) {
                        if ( typeof value !== 'undefined' ) {                        
                            if ( ctr < tempMaxLabels ) {                            
                                $scope.varButtonLabel += ( $scope.varButtonLabel.length > 0 ? '</div>, <div class="buttonLabel">' : '<div class="buttonLabel">') + $scope.writeLabel( value, 'buttonLabel', true );
                            }
                            ctr++;
                        }
                    });                

                    if ( $scope.more === true ) {
                        // https://github.com/isteven/angular-multi-select/pull/16
                        if (tempMaxLabels > 0) {
                            $scope.varButtonLabel += ', ... ';
                        }
                        $scope.varButtonLabel += '(Total: ' + $scope.selectedItems.length + ')';                        
                    }
                }
                $scope.varButtonLabel = $sce.trustAsHtml( $scope.varButtonLabel + '<span class="caret"></span>' );                
            }

            // Check if a checkbox is disabled or enabled. It will check the granular control (disableProperty) and global control (isDisabled)
            // Take note that the granular control has higher priority.
            $scope.itemIsDisabled = function( item ) {
                
                if ( typeof attrs.disableProperty !== 'undefined' && item[ $scope.disableProperty ] === true ) {                                        
                    return true;
                }
                else {             
                    if ( $scope.isDisabled === true ) {                        
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                
            }

            // A simple function to parse the item label settings
            $scope.writeLabel = function( item, type, flag ) {
                var label = '';
                var temp = $scope[ type ].split( ' ' );                    
                angular.forEach( temp, function( value2, key2 ) {
                    if ( typeof value2 !== 'undefined' ) {                        
                        angular.forEach( item, function( value1, key1 ) {                    
                            if ( key1 == value2 ) {
                            	if(flag){                            		
                            		label += value1;        
                            	}else{
                            		label += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + value1;        
                            	}
                            }
                        });                    
                    }
                });
                if ( type.toUpperCase() === 'BUTTONLABEL' ) {
                    return label;
                }
                return $sce.trustAsHtml( label );
            }

            // UI operations to show/hide checkboxes based on click event..
            $scope.toggleCheckboxes = function( e ) {    

                // Just to make sure.. had a bug where key events were recorded twice
                angular.element( document ).unbind( 'click', $scope.externalClickListener );
                angular.element( window ).unbind( 'keypress', $scope.keyboardListener );                                    

                // clear filter
                $scope.inputLabel.labelFilter = '';                
                $scope.updateFilter();                

                // close if ESC key is pressed.
                if ( e.keyCode === 27 ) {
                    angular.element( $scope.checkBoxLayer ).removeClass( 'show' );                    
                    angular.element( clickedEl ).removeClass( 'buttonClicked' );                    
                    angular.element( document ).unbind( 'click', $scope.externalClickListener );
                    angular.element( window ).unbind( 'keypress', $scope.keyboardListener );                                                                            

                    // clear the focused element;
                    $scope.removeFocusStyle( $scope.tabIndex );

                    // close callback
                    $scope.onClose( { data: element } );
                    return true;
                }
                
                // Our button accept HTML tags. Depending on browser, the click event might be intercepted by those tags instead of the button. 
                // Since we want the button to handle click event, we need traverse up to find the button element.
                if ( e.target ) {                    
                    if ( e.target.tagName.toUpperCase() !== 'BUTTON' && e.target.className.indexOf( 'multiSelectButton' ) < 0 ) {
                        if ( attrs.selectionMode && $scope.selectionMode.toUpperCase() === 'SINGLE' ) {
                            e = $scope.findUpTag( e.target, 'div', 'checkboxLayer' );
                            e = e.previousSibling;    
                        }
                        else {
                            e = $scope.findUpTag( e.target, 'button', 'multiSelectButton' );
                        }
                    }
                    else {
                        e = e.target;
                    }
                }                 
                clickedEl = e;
                $scope.checkBoxLayer = clickedEl.nextSibling;                

                // The idea below was taken from another multi-select directive - https://github.com/amitava82/angular-multiselect 
                // His version is awesome if you need a more simple multi-select approach.

                // close
                if ( angular.element( $scope.checkBoxLayer ).hasClass( 'show' )) {                                          
                    angular.element( $scope.checkBoxLayer ).removeClass( 'show' );                    
                    angular.element( clickedEl ).removeClass( 'buttonClicked' );                    
                    angular.element( document ).unbind( 'click', $scope.externalClickListener );
                    angular.element( window ).unbind( 'keypress', $scope.keyboardListener );                                    

                    // clear the focused element;
                    $scope.removeFocusStyle( $scope.tabIndex );

                    // close callback
                    $scope.onClose( { data: element } );
                } 
                // open
                else                 
                {           
                    helperItems = [];
                    helperItemsLength = 0;

                    angular.element( $scope.checkBoxLayer ).addClass( 'show' );                         
                    angular.element( clickedEl ).addClass( 'buttonClicked' );                                        
                    angular.element( document ).bind( 'click', $scope.externalClickListener );
                    angular.element( window ).bind( 'keypress', $scope.keyboardListener );  

                    // open callback
                    $scope.onOpen( { data: element } );

                    // to get the initial tab index, depending on how many helper elements we have. 
                    // priority is to always focus it on the input filter 
                    $scope.getFormElements();
                    $scope.tabIndex = 0;

                    var helperContainer = angular.element( element[ 0 ].querySelector( '.helperContainer' ) )[0];                
                    
                    if ( typeof helperContainer !== 'undefined' ) {
                        for ( i = 0; i < helperContainer.getElementsByTagName( 'BUTTON' ).length ; i++ ) {
                            helperItems[ i ] = helperContainer.getElementsByTagName( 'BUTTON' )[ i ];
                        }
                        helperItemsLength = helperItems.length + helperContainer.getElementsByTagName( 'INPUT' ).length;
                    }
                    
                    // focus on the filter element on open. 
                    if ( element[ 0 ].querySelector( '.inputFilter' ) ) {                        
                        element[ 0 ].querySelector( '.inputFilter' ).focus();                        
                        $scope.tabIndex = $scope.tabIndex + helperItemsLength - 2;
                    }
                    // if there's no filter then just focus on the first checkbox item
                    else {                        
                        $scope.formElements[ $scope.tabIndex ].focus();
                    }                    
                }                            
            }
            
            // handle clicks outside the button / multi select layer
            $scope.externalClickListener = function( e ) {                   
                targetsArr = element.find( e.target.tagName );
                for (var i = 0; i < targetsArr.length; i++) {                                        
                    if ( e.target == targetsArr[i] ) {
                        return;
                    }
                }

                angular.element( $scope.checkBoxLayer.previousSibling ).removeClass( 'buttonClicked' );                    
                angular.element( $scope.checkBoxLayer ).removeClass( 'show' );
                angular.element( document ).unbind( 'click', $scope.externalClickListener ); 
                angular.element( document ).unbind( 'click', $scope.keyboardListener );                
                // close callback
                $scope.onClose( { data: element } );
            }
   
            // traverse up to find the button tag
            // http://stackoverflow.com/questions/7332179/how-to-recursively-search-all-parentnodes
            $scope.findUpTag = function ( el, tag, className ) {
                while ( el.parentNode ) {
                    el = el.parentNode;      
                    if ( typeof el.tagName !== 'undefined' ) {
                        if ( el.tagName.toUpperCase() === tag.toUpperCase() && el.className.indexOf( className ) > -1 ) {
                            return el;
                        }
                    }
                }
                return null;
            }

            // select All / select None / reset buttons
            $scope.select = function( type, e ) {

                helperIndex = helperItems.indexOf( e.target );
                $scope.tabIndex = helperIndex;

                switch( type.toUpperCase() ) {
                    case 'ALL':
                        angular.forEach( $scope.filteredModel, function( value, key ) {                            
                            if ( typeof value !== 'undefined' && value[ $scope.disableProperty ] !== true ) {                                
                                if ( typeof value[ $scope.groupProperty ] === 'undefined' ) {                                
                                    value[ $scope.tickProperty ] = true;
                                }
                            }
                        });         
                        break;
                    case 'NONE':
                        angular.forEach( $scope.filteredModel, function( value, key ) {
                            if ( typeof value !== 'undefined' && value[ $scope.disableProperty ] !== true ) {                        
                                if ( typeof value[ $scope.groupProperty ] === 'undefined' ) {                                
                                    value[ $scope.tickProperty ] = false;
                                }
                            }
                        });               
                        break;
                    case 'RESET':            
                        angular.forEach( $scope.filteredModel, function( value, key ) {                            
                            if ( typeof value[ $scope.groupProperty ] === 'undefined' && typeof value !== 'undefined' && value[ $scope.disableProperty ] !== true ) {                        
                                temp = value[ $scope.indexProperty ];                                
                                value[ $scope.tickProperty ] = $scope.backUp[ temp ][ $scope.tickProperty ];
                            }
                        });               
                        break;
                    case 'CLEAR':
                        $scope.tabIndex = $scope.tabIndex + 1;
                        break;
                    case 'FILTER':                        
                        $scope.tabIndex = helperItems.length - 1;
                        break;
                    default:                        
                }                                                                                 
            } 
            $scope.syncSelectAll = function(){
            	var all = true, none = true;
            	$scope.filteredModel.forEach(function(item){
            		if(item.ticked){
            			none = false;
            		} else {
            			all = false;
            		}
            	});
            	if($scope.sflag && none){
//            		angular.element( $scope.formElements[ 2 ] ).parent().parent().parent().removeClass( 'multiSelectFocus' );
            		$scope.sflag = !$scope.sflag;
            	}
            	if(!$scope.sflag && all){
//            		angular.element( $scope.formElements[ 2 ] ).parent().parent().parent().addClass( 'multiSelectFocus' );
            		$scope.sflag = !$scope.sflag;
            	}
            }
            $scope.sflag = false;
            $scope.selected = function(){
            	if(!$scope.sflag){
            		$scope.select('all',{});
//            		angular.element( $scope.formElements[ 2 ] ).parent().parent().parent().addClass( 'multiSelectFocus' );
            	} else {
            		$scope.select('none',{});
//            		angular.element( $scope.formElements[ 2 ] ).parent().parent().parent().removeClass( 'multiSelectFocus' );
            	}
            	$scope.sflag = !$scope.sflag;
            }

            // just to create a random variable name                
            genRandomString = function( length ) {                
                var possible    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                var temp        = '';
                for( var i=0; i < length; i++ ) {
                     temp += possible.charAt( Math.floor( Math.random() * possible.length ));
                }
                return temp;
            }

            // count leading spaces
            $scope.prepareGrouping = function() {
                var spacing     = 0;                                                
                angular.forEach( $scope.filteredModel, function( value, key ) {
                    value[ $scope.spacingProperty ] = spacing;                    
                    if ( value[ $scope.groupProperty ] === true ) {
                        spacing+=2;
                    }                    
                    else if ( value[ $scope.groupProperty ] === false ) {
                        spacing-=2;
                    }                 
                });
            }

            // prepare original index
            $scope.prepareIndex = function() {
                ctr = 0;
                angular.forEach( $scope.filteredModel, function( value, key ) {
                    value[ $scope.indexProperty ] = ctr;
                    ctr++;
                });
            }

            // navigate using up and down arrow
            $scope.keyboardListener = function( e ) {                
                
                var key = e.keyCode ? e.keyCode : e.which;      
                var isNavigationKey = false;

                // ESC key (close)
                if ( key === 27 ) {
                    $scope.toggleCheckboxes( e );
                }                    
                
                // next element ( tab, down & right key )                    
                else if ( key === 40 || key === 39 || ( !e.shiftKey && key == 9 ) ) {                    
                    isNavigationKey = true;
                    prevTabIndex = $scope.tabIndex; 
                    $scope.tabIndex++;                         
                    if ( $scope.tabIndex > $scope.formElements.length - 1 ) {
                        $scope.tabIndex = 0;
                        prevTabIndex = $scope.formElements.length - 1; 
                    }                                                            
                    while ( $scope.formElements[ $scope.tabIndex ].disabled === true ) {                                                                        
                        $scope.tabIndex++;
                        if ( $scope.tabIndex > $scope.formElements.length - 1 ) {
                            $scope.tabIndex = 0;                            
                        }                                                                                    
                    }
                }
                
                // prev element ( shift+tab, up & left key )
                else if ( key === 38 || key === 37 || ( e.shiftKey && key == 9 ) ) { 
                    isNavigationKey = true;
                    prevTabIndex = $scope.tabIndex; 
                    $scope.tabIndex--;                              
                    if ( $scope.tabIndex < 0 ) {
                        $scope.tabIndex = $scope.formElements.length - 1;
                        prevTabIndex = 0;
                    }                                         
                    while ( $scope.formElements[ $scope.tabIndex ].disabled === true ) {
                        $scope.tabIndex--;
                        if ( $scope.tabIndex < 0 ) {
                            $scope.tabIndex = $scope.formElements.length - 1;
                        }                                                                 
                    }                                 
                }    

                if ( isNavigationKey === true ) {                     

                    e.preventDefault();
                    e.stopPropagation();                    

                    // set focus on the checkbox
                    $scope.formElements[ $scope.tabIndex ].focus();                                    
                    
                    // css styling
                    var actEl = document.activeElement;        

                    if ( actEl.type.toUpperCase() === 'CHECKBOX' ) {                                                   
                        $scope.setFocusStyle( $scope.tabIndex );
                        $scope.removeFocusStyle( prevTabIndex );
                    }                    
                    else {
                        $scope.removeFocusStyle( prevTabIndex );
                        $scope.removeFocusStyle( helperItemsLength );
                        $scope.removeFocusStyle( $scope.formElements.length - 1 );
                    } 
                }

                isNavigationKey = false;
            }

            // set (add) CSS style on selected row
            $scope.setFocusStyle = function( tabIndex ) {                
                angular.element( $scope.formElements[ tabIndex + 1 ] ).parent().parent().parent().addClass( 'multiSelectFocus' );                        
            }

            // remove CSS style on selected row
            $scope.removeFocusStyle = function( tabIndex ) {
                angular.element( $scope.formElements[ tabIndex + 1 ] ).parent().parent().parent().removeClass( 'multiSelectFocus' );
            }

            ///////////////////////////////////////////////////////
            //
            // Logic starts here, initiated by watch 1 & watch 2.
            //
            ///////////////////////////////////////////////////////

            var tempStr = genRandomString( 5 );
            $scope.indexProperty = 'idx_' + tempStr;
            $scope.spacingProperty = 'spc_' + tempStr;         

            // set orientation css            
            if ( typeof attrs.orientation !== 'undefined' ) {
                if ( attrs.orientation.toUpperCase() === 'HORIZONTAL' ) {                    
                    $scope.orientationH = true;
                    $scope.orientationV = false;
                }
                else {
                    $scope.orientationH = false;
                    $scope.orientationV = true;
                }
            }            
            
            // watch1, for changes in input model property
            // updates multi-select when user select/deselect a single checkbox programatically
            // https://github.com/isteven/angular-multi-select/issues/8
            $scope.$watch( 'inputModel' , function( newVal ) {                 
                if ( newVal ) {
                    $scope.refreshSelectedItems();                                   
                    $scope.refreshOutputModel();
                    $scope.refreshButton();                                 
                }
            }, true);

            // watch2 for changes in input model as a whole
            // this on updates the multi-select when a user load a whole new input-model. We also update the $scope.backUp variable
            $scope.$watch( 'inputModel' , function( newVal ) {  
                if ( newVal ) {
                    $scope.backUp = angular.copy( $scope.inputModel );    
                    $scope.updateFilter();
                    $scope.prepareGrouping();
                    $scope.prepareIndex();                                                
                    $scope.refreshSelectedItems();                                   
                    $scope.refreshOutputModel();                
                    $scope.refreshButton();                                                                                                                 
                }
            });            

            // watch for changes in directive state (disabled or enabled)
            $scope.$watch( 'isDisabled' , function( newVal ) {         
                $scope.isDisabled = newVal;                               
            });            

            // this is for touch enabled devices. We don't want to hide checkboxes on scroll. 
            angular.element( document ).bind( 'touchstart', function( e ) { 
                $scope.$apply( function() {
                    $scope.scrolled = false;
                }); 
            });
            
            // also for touch enabled devices
            angular.element( document ).bind( 'touchmove', function( e ) { 
                $scope.$apply( function() {
                    $scope.scrolled = true;                
                });
            });
                    
            // for IE8, perhaps. Not sure if this is really executed.
            if ( !Array.prototype.indexOf ) {
                Array.prototype.indexOf = function(what, i) {                    
                    i = i || 0;
                    var L = this.length;
                    while (i < L) {
                        if(this[i] === what) return i;
                        ++i;
                    }
                    return -1;
                };
            }
        }   
    }
}]);

